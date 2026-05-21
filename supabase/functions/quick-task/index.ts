// quick-task — processa pagamento com cartão via Mercado Pago
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
      console.error("[quick-task] CRÍTICO: MP_ACCESS_TOKEN não está configurado nas variáveis de ambiente do Supabase.");
      return resp({ error: "Configuração do servidor incompleta: MP_ACCESS_TOKEN ausente. Contate o suporte." }, 500);
    }

    const isTestToken = mpToken.startsWith("TEST-");
    const mpAmbiente = isTestToken ? "teste" : "producao";
    console.log("[quick-task] ambiente MP_ACCESS_TOKEN: %s (prefixo: %s)",
      mpAmbiente, mpToken.slice(0, 8) + "***");

    // Token de teste não consegue processar tokens gerados com chave pública de produção.
    // Se detectar mismatch, retorna erro imediatamente sem chamar o MP.
    const tokenStr = String(token);
    const isTestCardToken = tokenStr.startsWith("TEST-") || tokenStr.length < 20;
    if (isTestToken && !isTestCardToken) {
      console.error("[quick-task] MISMATCH: MP_ACCESS_TOKEN é de TESTE mas o token do cartão parece de PRODUÇÃO. Troque MP_ACCESS_TOKEN por credencial de produção (APP_USR-...).");
    }
    if (!isTestToken && isTestCardToken) {
      console.error("[quick-task] MISMATCH: MP_ACCESS_TOKEN é de PRODUÇÃO mas o token do cartão parece de TESTE. Use cartões reais em produção.");
    }

    // ── 4. Valor de acordo com o plano ─────────────────────────────────────
    const valor = String(plano) === "anual" ? 699.90 : 73.90;

    // ── 5. Monta identificação do pagador (CPF) ────────────────────────────
    // Só inclui se o número foi preenchido — enviar {} causa erro 400 no MP.
    const payerObj = (payer && typeof payer === "object") ? payer as Record<string, unknown> : {};
    const identObj = (payerObj.identification && typeof payerObj.identification === "object")
      ? payerObj.identification as Record<string, unknown>
      : {};
    const cpfNumeros = String(identObj.number ?? "").replace(/\D/g, "");
    const identification = cpfNumeros
      ? { type: String(identObj.type ?? "CPF"), number: cpfNumeros }
      : null;

    // ── 6. Payload para o MP ───────────────────────────────────────────────
    const mpPayload: Record<string, unknown> = {
      transaction_amount: valor,
      token,
      description: `Controle IATF – Plano ${plano ?? "anual"}`,
      installments: Number(installments) || 1,
      payment_method_id,
      payer: {
        email: String(payerObj.email ?? email ?? ""),
        first_name: String(payerObj.first_name ?? ""),
        last_name: String(payerObj.last_name ?? ""),
        ...(identification ? { identification } : {}),
      },
    };
    if (issuer_id) mpPayload.issuer_id = Number(issuer_id);

    console.log("[quick-task] iniciando pagamento: plano=%s valor=%s userId=%s method=%s cpf=%s token=%s",
      plano, valor, userId, payment_method_id,
      identification ? identification.number.slice(0, 3) + "***" : "NÃO ENVIADO",
      String(token).slice(0, 14) + "***",
    );

    // ── 7. Chama a API do Mercado Pago ─────────────────────────────────────
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json().catch(() => ({ _parse_error: true, _mp_raw_status: mpRes.status }));

    console.log("[quick-task] MP respondeu: http=%s status=%s detail=%s id=%s cause=%s",
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
          .update({ assinante: true, plano: plano ?? "anual", mp_payment_id: String(mpData.id) })
          .eq("id", userId);
        if (dbErr) console.error("[quick-task] Supabase update error:", dbErr.message);
        else console.log("[quick-task] perfil atualizado — assinante=true plano=%s", plano);
      } catch (dbEx) {
        console.error("[quick-task] Supabase exception:", dbEx);
      }
    }

    // Sempre HTTP 200 quando o MP respondeu (mesmo que pagamento rejeitado ou erro de validação MP).
    // O campo _mp_http_status informa o código real do MP para o frontend interpretar.
    return resp({ ...mpData, _mp_http_status: mpRes.status, _mp_ambiente: mpAmbiente });

  } catch (e) {
    console.error("[quick-task] exception não tratada:", e);
    return resp({ error: String((e as Error)?.message ?? "Erro interno desconhecido."), _tipo: "excecao_servidor" }, 500);
  }
});
