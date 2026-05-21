// mp-diagnostico — identifica qual conta Mercado Pago está configurada
// Chamar via GET: https://<projeto>.supabase.co/functions/v1/mp-diagnostico
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

  const resultado = {
    ambiente,
    prefixo_token: prefixo,
    conta_id: conta?.id ?? "não identificado",
    conta_email: conta?.email ?? "não identificado",
    conta_nome: conta?.first_name
      ? `${conta.first_name} ${conta.last_name ?? ""}`.trim()
      : "não identificado",
    conta_site_status: conta?.site_status ?? "não identificado",
    erro_users_me: erroMe || null,
    raw: conta,
  };

  console.log("[mp-diagnostico] resultado:", JSON.stringify(resultado));

  return new Response(JSON.stringify(resultado, null, 2), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
