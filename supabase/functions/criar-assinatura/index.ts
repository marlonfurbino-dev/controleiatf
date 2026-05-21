// criar-assinatura — processa pagamento com cartão via Mercado Pago (plano mensal)
// Lógica idêntica ao quick-task; separado por semântica (mensal vs avulso).
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
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return resp({ error: "Body inválido ou não é JSON." }, 400);
    }

    const { token, plano, email, userId, installments, payment_method_id, issuer_id, payer } = body as Record<string, unknown>;

    if (!token)             return resp({ error: "Campo obrigatório ausente: token. O cartão não foi tokenizado." }, 400);
    if (!userId)            return resp({ error: "Campo obrigatório ausente: userId." }, 400);
    if (!payment_method_id) return resp({ error: "Campo obrigatório ausente: payment_method_id." }, 400);

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("[criar-assinatura] CRÍTICO: MP_ACCESS_TOKEN não configurado.");
      return resp({ error: "Configuração do servidor incompleta: MP_ACCESS_TOKEN ausente. Contate o suporte." }, 500);
    }

    const isTestToken = mpToken.startsWith("TEST-");
    const mpAmbiente = isTestToken ? "teste" : "producao";
    console.log("[criar-assinatura] ambiente MP_ACCESS_TOKEN: %s (prefixo: %s)",
      mpAmbiente, mpToken.slice(0, 8) + "***");

    // ── Identifica qual conta MP está associada ao token ───────────────────
    let mpContaEmail = "não identificado";
    let mpContaId: string | number = "?";
    try {
      const meRes = await fetch("https://api.mercadopago.com/users/me", {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const meData = await meRes.json().catch(() => ({}));
      mpContaEmail = meData?.email ?? "não identificado";
      mpContaId = meData?.id ?? "?";
      console.log("[criar-assinatura] CONTA MP ATIVA: id=%s email=%s nickname=%s",
        mpContaId, mpContaEmail, meData?.nickname ?? "");
    } catch (meEx) {
      console.warn("[criar-assinatura] Não foi possível identificar conta MP:", meEx);
    }

    const valor = String(plano) === "anual" ? 699.90 : 73.90;

    const payerObj = (payer && typeof payer === "object") ? payer as Record<string, unknown> : {};
    const identObj = (payerObj.identification && typeof payerObj.identification === "object")
      ? payerObj.identification as Record<string, unknown>
      : {};
    const cpfNumeros = String(identObj.number ?? "").replace(/\D/g, "");
    const identification = cpfNumeros
      ? { type: String(identObj.type ?? "CPF"), number: cpfNumeros }
      : null;

    // ── Busca perfil no Supabase para complementar payer.first_name / last_name ──
    // Melhora pontuação de qualidade MP (+3 pts).
    let perfilNome = "";
    let perfilSobrenome = "";
    try {
      const sbProfile = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: perfil } = await sbProfile
        .from("perfis")
        .select("nome, sobrenome")
        .eq("id", userId)
        .single();
      perfilNome = String(perfil?.nome ?? "").trim();
      perfilSobrenome = String(perfil?.sobrenome ?? "").trim();
    } catch (profileEx) {
      console.warn("[criar-assinatura] erro ao buscar perfil:", profileEx);
    }

    const firstName = String(payerObj.first_name ?? "").trim() || perfilNome;
    const lastName  = String(payerObj.last_name  ?? "").trim() || perfilSobrenome;

    // Nota: o SDK oficial do MP (npm:mercadopago) não é compatível com Deno Edge Functions.
    // Usando fetch direto, que é equivalente e sem dependências externas.
    const planoLabel = String(plano ?? "mensal") === "anual" ? "Anual" : "Mensal";
    const mpPayload: Record<string, unknown> = {
      transaction_amount: valor,
      token,
      external_reference: String(userId),
      description: `Controle IATF – Plano ${planoLabel}`,
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: String(payerObj.email ?? email ?? ""),
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName  ? { last_name:  lastName  } : {}),
        ...(identification ? { identification } : {}),
      },
      // additional_info.items: melhora pontuação de qualidade MP (+2 pts)
      additional_info: {
        items: [{
          id: `controle-iatf-${plano ?? "mensal"}`,
          title: `Controle IATF – Plano ${planoLabel}`,
          description: String(plano) === "anual"
            ? "Acesso completo ao Controle IATF por 12 meses"
            : "Acesso completo ao Controle IATF por 1 mês",
          quantity: 1,
          unit_price: valor,
        }],
      },
    };
    if (issuer_id) mpPayload.issuer_id = Number(issuer_id);

    console.log("[criar-assinatura] payload enviado ao MP: plano=%s valor=%s userId=%s method=%s installments=%s issuer=%s cpf=%s firstName=%s lastName=%s email=%s token=%s",
      plano, valor, userId, payment_method_id,
      Number(installments) || 1,
      issuer_id ?? "(sem issuer)",
      identification ? identification.number.slice(0, 3) + "***" : "NÃO ENVIADO",
      firstName || "(vazio)",
      lastName  || "(vazio)",
      String(payerObj.email ?? email ?? "") || "(vazio)",
      String(token).slice(0, 14) + "***",
    );

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json().catch(() => ({ _parse_error: true }));

    console.log("[criar-assinatura] MP http=%s status=%s detail=%s id=%s cause=%s",
      mpRes.status, mpData?.status ?? "(sem status)",
      mpData?.status_detail ?? "", mpData?.id ?? "",
      JSON.stringify(mpData?.cause ?? []),
    );

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
        if (dbErr) console.error("[criar-assinatura] Supabase error:", dbErr.message);
      } catch (dbEx) {
        console.error("[criar-assinatura] Supabase exception:", dbEx);
      }
    }

    return resp({ ...mpData, _mp_http_status: mpRes.status, _mp_ambiente: mpAmbiente, _mp_conta_email: mpContaEmail, _mp_conta_id: String(mpContaId) });

  } catch (e) {
    console.error("[criar-assinatura] exception:", e);
    return resp({ error: String((e as Error)?.message ?? "Erro interno."), _tipo: "excecao_servidor" }, 500);
  }
});
