// criar-assinatura — cobrança de cartão para plano mensal
// Processa pagamento no Mercado Pago e persiste assinante=true no Supabase.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    console.log("[criar-assinatura] body recebido:", JSON.stringify(body));

    const {
      token,
      plano,
      email,
      userId,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    } = body;

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: "token e userId são obrigatórios" }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MP_ACCESS_TOKEN não configurado");

    // Mensal = R$ 73,90 | Anual (fallback) = R$ 699,90
    const valor = plano === "anual" ? 699.90 : 73.90;

    // ── Cria pagamento no Mercado Pago ───────────────────────────────────
    const mpBody = {
      transaction_amount: valor,
      token,
      description: `Controle IATF - Plano ${plano ?? "mensal"}`,
      installments: Number(installments) || 1,
      payment_method_id,
      issuer_id: issuer_id ? Number(issuer_id) : undefined,
      payer: {
        email: payer?.email ?? email,
        first_name: payer?.first_name ?? "",
        last_name: payer?.last_name ?? "",
        identification: payer?.identification ?? {},
      },
    };

    console.log("[criar-assinatura] chamando MP:", JSON.stringify(mpBody));

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify(mpBody),
    });

    const payment = await mpRes.json();
    console.log("[criar-assinatura] resposta MP:", mpRes.status, JSON.stringify(payment));

    // ── Persiste assinatura no Supabase quando aprovado ──────────────────
    const okStatus = ["approved", "authorized", "in_process", "pending"];
    if (okStatus.includes(payment.status)) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      const { error: dbError } = await supabase
        .from("perfis")
        .update({
          assinante: true,
          plano: plano ?? "mensal",
          mp_payment_id: String(payment.id),
        })
        .eq("id", userId);

      if (dbError) {
        console.error("[criar-assinatura] Erro ao atualizar perfil:", dbError.message);
      }
    }

    return new Response(JSON.stringify(payment), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: mpRes.ok ? 200 : 422,
    });
  } catch (e) {
    console.error("[criar-assinatura] error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
