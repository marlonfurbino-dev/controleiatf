// mp-diagnostico — identifica conta MP e consulta pagamento por ID
// GET  → info da conta
// GET ?payment_id=xxx → info da conta + detalhes do pagamento
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
  if (!mpToken) {
    return new Response(JSON.stringify({ erro: "MP_ACCESS_TOKEN não configurado." }), {
      headers: { ...CORS, "Content-Type": "application/json" }, status: 500,
    });
  }

  const ambiente = mpToken.startsWith("TEST-") ? "TESTE" : "PRODUCAO";
  const prefixo = mpToken.slice(0, 12) + "***";

  // Conta
  let conta: Record<string, unknown> = {};
  let erroMe = "";
  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${mpToken}` },
    });
    conta = await res.json().catch(() => ({}));
    if (!res.ok) erroMe = `HTTP ${res.status}`;
  } catch (e) {
    erroMe = String(e);
  }

  // Pagamento (opcional)
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("payment_id");
  let pagamento: Record<string, unknown> | null = null;
  let erroPag = "";
  if (paymentId) {
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      pagamento = await res.json().catch(() => ({}));
      if (!res.ok) erroPag = `HTTP ${res.status}`;
    } catch (e) {
      erroPag = String(e);
    }
  }

  const resultado = {
    ambiente,
    prefixo_token: prefixo,
    conta_id: conta?.id ?? "não identificado",
    conta_email: conta?.email ?? "não identificado",
    conta_nome: conta?.first_name
      ? `${conta.first_name} ${conta.last_name ?? ""}`.trim()
      : "não identificado",
    conta_site_status: conta?.site_status ?? "não identificado",
    mercadopago_account_type: (conta?.status as Record<string,unknown>)?.mercadopago_account_type ?? "?",
    credit_rank: (conta?.credit as Record<string,unknown>)?.rank ?? "?",
    seller_experience: conta?.seller_experience ?? "?",
    seller_transactions: ((conta?.seller_reputation as Record<string,unknown>)?.transactions as Record<string,unknown>)?.total ?? "?",
    erro_users_me: erroMe || null,
    ...(paymentId ? {
      pagamento_id: paymentId,
      pagamento_status: pagamento?.status ?? "?",
      pagamento_status_detail: pagamento?.status_detail ?? "?",
      pagamento_cause: pagamento?.cause ?? [],
      pagamento_valor: pagamento?.transaction_amount ?? "?",
      pagamento_metodo: pagamento?.payment_method_id ?? "?",
      pagamento_payer_email: (pagamento?.payer as Record<string,unknown>)?.email ?? "?",
      erro_pagamento: erroPag || null,
      pagamento_raw: pagamento,
    } : {}),
    raw_conta: conta,
  };

  console.log("[mp-diagnostico] resultado:", JSON.stringify(resultado));

  return new Response(JSON.stringify(resultado, null, 2), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
