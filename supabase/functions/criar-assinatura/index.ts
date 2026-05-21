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

    const valor = String(plano) === "anual" ? 699.90 : 73.90;

    const payerObj = (payer && typeof payer === "object") ? payer as Record<string, unknown> : {};
    const identObj = (payerObj.identification && typeof payerObj.identification === "object")
      ? payerObj.identification as Record<string, unknown>
      : {};
    const cpfNumeros = String(identObj.number ?? "").replace(/\D/g, "");
    const identification = cpfNumeros
      ? { type: String(identObj.type ?? "CPF"), number: cpfNumeros }
      : null;

    const mpPayload: Record<string, unknown> = {
      transaction_amount: valor,
      token,
      description: `Controle IATF – Plano ${plano ?? "mensal"}`,
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

    console.log("[criar-assinatura] plano=%s valor=%s userId=%s method=%s cpf=%s token=%s",
      plano, valor, userId, payment_method_id,
      identification ? identification.number.slice(0, 3) + "***" : "NÃO ENVIADO",
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

    return resp({ ...mpData, _mp_http_status: mpRes.status, _mp_ambiente: mpAmbiente });

  } catch (e) {
    console.error("[criar-assinatura] exception:", e);
    return resp({ error: String((e as Error)?.message ?? "Erro interno."), _tipo: "excecao_servidor" }, 500);
  }
});
