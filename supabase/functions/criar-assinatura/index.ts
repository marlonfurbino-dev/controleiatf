// criar-assinatura — processa pagamento com cartão via Mercado Pago
// Cobre ambos os planos (anual e mensal). Sempre retorna HTTP 200 quando o MP
// responde; HTTP 400/500 apenas para erros antes de chamar o MP.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resp = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    headers: { ...CORS, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── 1. Parse do body ───────────────────────────────────────────────────
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return resp({ error: "Body inválido ou não é JSON." }, 400);
    }

    const { token, plano, email, userId, installments, payment_method_id, issuer_id, payer } = body as Record<string, unknown>;

    // ── 2. Validação de entradas ───────────────────────────────────────────
    if (!token)             return resp({ error: "Campo obrigatório ausente: token. O cartão não foi tokenizado." }, 400);
    if (!userId)            return resp({ error: "Campo obrigatório ausente: userId." }, 400);
    if (!payment_method_id) return resp({ error: "Campo obrigatório ausente: payment_method_id." }, 400);

    // ── 3. Credencial do MP ────────────────────────────────────────────────
    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("[criar-assinatura] CRÍTICO: MP_ACCESS_TOKEN não configurado.");
      return resp({ error: "Configuração do servidor incompleta: MP_ACCESS_TOKEN ausente." }, 500);
    }

    const isTestToken = mpToken.startsWith("TEST-");
    const mpAmbiente = isTestToken ? "teste" : "producao";
    console.log("[criar-assinatura] ambiente: %s", mpAmbiente);

    // ── Identifica conta MP ─────────────────────────────────────────────────
    let mpContaEmail = "não identificado";
    let mpContaId: string | number = "?";
    try {
      const meRes = await fetch("https://api.mercadopago.com/users/me", {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const meData = await meRes.json().catch(() => ({}));
      mpContaEmail = meData?.email ?? "não identificado";
      mpContaId = meData?.id ?? "?";
      console.log("[criar-assinatura] CONTA MP: id=%s email=%s", mpContaId, mpContaEmail);
    } catch (_) { /* não crítico */ }

    // ── 4. Valor de acordo com o plano ─────────────────────────────────────
    const valor = String(plano) === "anual" ? 699.90 : 73.90;

    // ── 5. Extrai dados do pagador ─────────────────────────────────────────
    const payerObj  = (payer && typeof payer === "object") ? payer as Record<string, unknown> : {};
    const identObj  = (payerObj.identification && typeof payerObj.identification === "object")
      ? payerObj.identification as Record<string, unknown> : {};
    const cpfNumeros = String(identObj.number ?? "").replace(/\D/g, "");
    const identification = cpfNumeros ? { type: "CPF", number: cpfNumeros } : null;

    const payerPhone   = (payerObj.phone   && typeof payerObj.phone   === "object") ? payerObj.phone   as Record<string, unknown> : null;
    const payerAddress = (payerObj.address && typeof payerObj.address === "object") ? payerObj.address as Record<string, unknown> : null;
    const payerDOB     = payerObj.date_of_birth ? String(payerObj.date_of_birth) : null;

    // ── 5b. Busca perfil no Supabase ──────────────────────────────────────
    let perfilNome = "";
    let perfilSobrenome = "";
    let registrationDate: string | null = null;
    try {
      const sbProfile = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: perfil } = await sbProfile
        .from("perfis")
        .select("nome, sobrenome, created_at")
        .eq("id", userId)
        .single();
      perfilNome       = String(perfil?.nome       ?? "").trim();
      perfilSobrenome  = String(perfil?.sobrenome  ?? "").trim();
      registrationDate = perfil?.created_at ? String(perfil.created_at) : null;
    } catch (profileEx) {
      console.warn("[criar-assinatura] erro ao buscar perfil:", profileEx);
    }

    const firstName = String(payerObj.first_name ?? "").trim() || perfilNome;
    const lastName  = String(payerObj.last_name  ?? "").trim() || perfilSobrenome;
    const payerEmail = String(payerObj.email ?? email ?? "");

    // ── 6. Monta payload para o MP ─────────────────────────────────────────
    // ESTRUTURA CORRETA:
    //   payer (top-level)     → email, name, identification, date_of_birth, address (billing)
    //   additional_info.payer → antifraude: name, phone, address, registration_date
    //   additional_info.items → category_id: "services" (categorização MP)
    const planoLabel = String(plano ?? "mensal") === "anual" ? "Anual" : "Mensal";

    const mpPayload: Record<string, unknown> = {
      transaction_amount: valor,
      token,
      external_reference: String(userId),
      description: `Controle IATF – Plano ${planoLabel}`,
      installments: Number(installments) || 1,
      payment_method_id,

      // Nó payer do topo: identificação + endereço de cobrança
      payer: {
        email: payerEmail,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName  ? { last_name:  lastName  } : {}),
        ...(identification ? { identification } : {}),
        ...(payerDOB ? { date_of_birth: payerDOB } : {}),
        ...(payerAddress ? {
          address: {
            zip_code:     String(payerAddress.zip_code     ?? ""),
            street_name:  String(payerAddress.street_name  ?? ""),
            street_number: String(payerAddress.street_number ?? ""),
            ...(payerAddress.neighborhood ? { neighborhood: String(payerAddress.neighborhood) } : {}),
            ...(payerAddress.city         ? { city:         String(payerAddress.city)         } : {}),
            ...(payerAddress.federal_unit ? { federal_unit: String(payerAddress.federal_unit) } : {}),
          }
        } : {}),
      },

      additional_info: {
        // items com category_id para categorização correta (reduz risco)
        items: [{
          id: `controle-iatf-${plano ?? "mensal"}`,
          title: `Controle IATF – Plano ${planoLabel}`,
          description: String(plano) === "anual"
            ? "Acesso completo ao Controle IATF por 12 meses"
            : "Acesso completo ao Controle IATF por 1 mês",
          category_id: "services",
          quantity: 1,
          unit_price: valor,
        }],

        // payer em additional_info: usado exclusivamente pelo antifraude do MP
        // Campos aqui têm peso diferente do payer do topo
        payer: {
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName  ? { last_name:  lastName  } : {}),
          ...(payerPhone ? {
            phone: {
              area_code: String(payerPhone.area_code ?? ""),
              number:    String(payerPhone.number    ?? ""),
            }
          } : {}),
          ...(payerAddress ? {
            address: {
              zip_code:     String(payerAddress.zip_code     ?? ""),
              street_name:  String(payerAddress.street_name  ?? ""),
              street_number: String(payerAddress.street_number ?? ""),
            }
          } : {}),
          registration_date: new Date(registrationDate ?? Date.now()).toISOString(),
        },
      },
    };

    if (issuer_id) mpPayload.issuer_id = Number(issuer_id);

    // Tenta encaminhar o IP real do usuário ao MP para pontuação de risco
    const userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

    console.log("[criar-assinatura] payload: plano=%s valor=%s cpf=%s nome='%s %s' email=%s dob=%s tel=%s cep=%s registration=%s token=%s userIp=%s",
      plano, valor,
      identification ? identification.number.slice(0, 3) + "***" : "NÃO ENVIADO",
      firstName || "(vazio)", lastName || "(vazio)",
      payerEmail || "(vazio)",
      payerDOB || "(vazio)",
      payerPhone ? (payerPhone.area_code + "..." + String(payerPhone.number).slice(-2)) : "(vazio)",
      payerAddress ? String(payerAddress.zip_code ?? "") : "(vazio)",
      registrationDate || "(vazio)",
      String(token).slice(0, 14) + "***",
      userIp || "(não identificado)",
    );

    // ── 7. Chama a API do Mercado Pago ─────────────────────────────────────
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
        ...(userIp ? { "X-Forwarded-For": userIp } : {}),
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json().catch(() => ({ _parse_error: true, _mp_raw_status: mpRes.status }));

    console.log("[criar-assinatura] MP respondeu: http=%s status=%s detail=%s id=%s cause=%s",
      mpRes.status,
      mpData?.status ?? "(sem campo status)",
      mpData?.status_detail ?? "",
      mpData?.id ?? "",
      JSON.stringify(mpData?.cause ?? []),
    );

    // ── 8. Persiste aprovação no Supabase ──────────────────────────────────
    const statusStr = String(mpData?.status ?? "");
    if (["approved", "authorized", "in_process", "pending"].includes(statusStr)) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );
        const { error: dbErr } = await supabase
          .from("perfis")
          .update({ assinante: true, plano: plano ?? "mensal", mp_payment_id: String(mpData.id) })
          .eq("id", userId);
        if (dbErr) console.error("[criar-assinatura] Supabase update error:", dbErr.message);
        else console.log("[criar-assinatura] perfil atualizado — assinante=true plano=%s", plano);
      } catch (dbEx) {
        console.error("[criar-assinatura] Supabase exception:", dbEx);
      }
    }

    return resp({ ...mpData, _mp_http_status: mpRes.status, _mp_ambiente: mpAmbiente, _mp_conta_email: mpContaEmail, _mp_conta_id: String(mpContaId) });

  } catch (e) {
    console.error("[criar-assinatura] exception não tratada:", e);
    return resp({ error: String((e as Error)?.message ?? "Erro interno desconhecido."), _tipo: "excecao_servidor" }, 500);
  }
});
