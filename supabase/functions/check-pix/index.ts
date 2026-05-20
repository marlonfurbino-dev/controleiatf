// check-pix — consulta status de pagamento PIX no MP e persiste no Supabase
// Chamado em polling a cada 5s pelo cliente enquanto aguarda confirmação.
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
    const { payment_id, userId, plano } = await req.json();

    if (!payment_id || !userId) {
      return new Response(
        JSON.stringify({ error: "payment_id e userId são obrigatórios" }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MP_ACCESS_TOKEN não configurado");

    // ── Consulta status do pagamento no Mercado Pago ─────────────────────
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${payment_id}`,
      { headers: { Authorization: `Bearer ${mpToken}` } },
    );

    if (!mpRes.ok) {
      const err = await mpRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: err.message ?? "Erro ao consultar MP", status: "error" }),
        { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const payment = await mpRes.json();

    // ── Persiste assinatura no Supabase quando PIX confirmado ────────────
    // BUG ORIGINAL: este bloco estava ausente — perfil.assinante nunca era
    // salvo no banco, então após logout/login o usuário voltava como trial.
    if (payment.status === "approved") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      const { error: dbError } = await supabase
        .from("perfis")
        .update({
          assinante: true,
          plano: plano ?? "anual",
          mp_payment_id: String(payment_id),
        })
        .eq("id", userId);

      if (dbError) {
        console.error("Erro ao atualizar perfil:", dbError.message);
      }
    }

    return new Response(
      JSON.stringify({ status: payment.status }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("check-pix error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...CORS, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
