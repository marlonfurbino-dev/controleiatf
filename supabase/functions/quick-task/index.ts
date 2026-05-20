// quick-task — cobrança única de cartão (plano anual)
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
    const {
      token,
      plano,
      email,
      userId,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    } = await req.json();

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: "token e userId são obrigatórios" }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MP_ACCESS_TOKEN não configurado");

    const valor = plano === "anual" ? 699.90 : 73.90;

    // ── Cria pagamento no Mercado Pago ───────────────────────────────────
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: valor,
        token,
        description: `Controle IATF - Plano ${plano}`,
        installments: Number(installments) || 1,
        payment_method_id,
        issuer_id: issuer_id ? Number(issuer_id) : undefined,
        payer: {
          email: payer?.email ?? email,
          first_name: payer?.first_name ?? "",
          last_name: payer?.last_name ?? "",
          identification: payer?.identification ?? {},
        },
      }),
    });

    const payment = await mpRes.json();

    // ── Persiste assinatura no Supabase quando aprovado ──────────────────
    // BUG ORIGINAL: este bloco estava ausente — o perfil nunca era atualizado.
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
          plano: plano,
          mp_payment_id: String(payment.id),
        })
        .eq("id", userId);

      if (dbError) {
        console.error("Erro ao atualizar perfil:", dbError.message);
        // Não falha o pagamento por erro de DB — o pagamento já foi aprovado.
        // O admin pode corrigir manualmente se necessário.
      }
    }

    return new Response(JSON.stringify(payment), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: mpRes.ok ? 200 : 422,
    });
  } catch (e) {
    console.error("quick-task error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
