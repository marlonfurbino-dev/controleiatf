// mp-webhook — recebe notificações do Mercado Pago (pagamentos PIX e cartão)
// Deployed com --no-verify-jwt para ser acessível sem autenticação de usuário.
// O MP chama este endpoint; não há Bearer token nas requisições externas.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const OK = new Response("ok", { status: 200 });

// Valida assinatura x-signature do MP (opcional — só valida se MP_WEBHOOK_SECRET configurado)
async function validarAssinatura(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!secret) return true; // sem secret configurado, aceita tudo (modo permissivo)

  const xSig = req.headers.get("x-signature") ?? "";
  const xReqId = req.headers.get("x-request-id") ?? "";

  // Formato: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(xSig.split(",").map(p => p.split("=")));
  const ts = parts["ts"] ?? "";
  const v1 = parts["v1"] ?? "";
  if (!ts || !v1) return false;

  // Extrai data.id do body para montar a mensagem de verificação
  let dataId = "";
  try {
    const parsed = JSON.parse(body);
    dataId = String(parsed?.data?.id ?? "");
  } catch (_) {}

  const msg = `id:${dataId};request-id:${xReqId};ts:${ts}`;
  const hmac = createHmac("sha256", secret).update(msg).digest("hex");
  return hmac === v1;
}

serve(async (req) => {
  // Preflight CORS (não esperado do MP, mas não custa)
  if (req.method === "OPTIONS") return OK;

  // Apenas POST é esperado
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const bodyText = await req.text().catch(() => "");

  // Responde 200 IMEDIATAMENTE — MP exige resposta em < 5 s
  // O processamento real acontece de forma assíncrona abaixo
  const processarEmBackground = async () => {
    try {
      // Valida assinatura (se MP_WEBHOOK_SECRET estiver configurado)
      const assinaturaOk = await validarAssinatura(req, bodyText);
      if (!assinaturaOk) {
        console.error("[mp-webhook] assinatura x-signature inválida — ignorando");
        return;
      }

      const body = JSON.parse(bodyText);
      console.log("[mp-webhook] recebido: action=%s type=%s data.id=%s",
        body?.action, body?.type, body?.data?.id);

      // Só processa eventos de pagamento
      const tipo = body?.type ?? body?.topic ?? "";
      if (!["payment", "merchant_order"].includes(tipo)) {
        console.log("[mp-webhook] tipo ignorado:", tipo);
        return;
      }

      const paymentId = body?.data?.id;
      if (!paymentId) {
        console.warn("[mp-webhook] data.id ausente no body:", bodyText.slice(0, 200));
        return;
      }

      const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
      if (!mpToken) { console.error("[mp-webhook] MP_ACCESS_TOKEN não configurado"); return; }

      // Consulta detalhes do pagamento no MP
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });

      if (!mpRes.ok) {
        console.error("[mp-webhook] erro ao consultar pagamento %s: http=%s", paymentId, mpRes.status);
        return;
      }

      const payment = await mpRes.json();
      console.log("[mp-webhook] pagamento %s: status=%s detail=%s valor=%s payer=%s",
        paymentId, payment.status, payment.status_detail,
        payment.transaction_amount, payment.payer?.email ?? "");

      // Só atualiza quando aprovado
      if (payment.status !== "approved") return;

      // Identifica o userId — campo external_reference (enviado no payload do quick-task/criar-assinatura)
      const userId = payment.external_reference ?? payment.metadata?.user_id ?? null;
      if (!userId) {
        console.warn("[mp-webhook] pagamento %s aprovado mas sem external_reference/userId", paymentId);
        return;
      }

      // Determina o plano pelo valor
      const valor = Number(payment.transaction_amount ?? 0);
      const plano = valor >= 600 ? "anual" : "mensal";

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      const { error } = await supabase
        .from("perfis")
        .update({ assinante: true, plano, mp_payment_id: String(paymentId) })
        .eq("id", userId);

      if (error) {
        console.error("[mp-webhook] erro ao atualizar perfil userId=%s: %s", userId, error.message);
      } else {
        console.log("[mp-webhook] perfil atualizado — userId=%s plano=%s paymentId=%s", userId, plano, paymentId);
      }
    } catch (e) {
      console.error("[mp-webhook] exception no processamento:", e);
    }
  };

  // Dispara processamento em background e retorna 200 imediatamente
  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as Record<string, unknown>).waitUntil) {
    (EdgeRuntime as Record<string, unknown>).waitUntil(processarEmBackground());
  } else {
    processarEmBackground(); // fallback (sem garantia de conclusão)
  }

  return OK;
});
