// notificar-cadastro — envia mensagem no Telegram a cada novo cadastro.
// Acionada por um Database Webhook do Supabase (INSERT na tabela `perfis`).
// Deploy com --no-verify-jwt (o webhook do Supabase não envia JWT de usuário).
//
// Variáveis de ambiente necessárias (Supabase → Edge Functions → Secrets):
//   TELEGRAM_BOT_TOKEN  → token do bot criado no @BotFather
//   TELEGRAM_CHAT_ID    → id do seu chat (veja instruções no chat)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OK = new Response("ok", { status: 200 });

serve(async (req) => {
  if (req.method === "OPTIONS") return OK;
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId   = Deno.env.get("TELEGRAM_CHAT_ID");
    if (!botToken || !chatId) {
      console.error("[notificar-cadastro] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID ausente");
      return OK; // não falha o webhook
    }

    const body = await req.json().catch(() => ({}));
    // Database Webhook envia: { type, table, record, old_record }
    const r = body?.record ?? body ?? {};

    const nome      = [r.nome, r.sobrenome].filter(Boolean).join(" ").trim() || "(sem nome)";
    const email     = r.email || "(sem e-mail)";
    const whatsapp  = r.whatsapp || "(sem telefone)";
    const cpf       = r.cpf || "—";
    const cidade    = [r.cidade, r.uf].filter(Boolean).join("/") || "—";

    const linhas = [
      "🎉 *Novo cadastro no Controle IATF*",
      "",
      `👤 ${escapar(nome)}`,
      `📱 ${escapar(whatsapp)}`,
      `✉️ ${escapar(email)}`,
      `🪪 CPF: ${escapar(cpf)}`,
      `📍 ${escapar(cidade)}`,
    ];

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: linhas.join("\n"),
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    if (!tgRes.ok) {
      const erro = await tgRes.text().catch(() => "");
      console.error("[notificar-cadastro] Telegram http=%s %s", tgRes.status, erro.slice(0, 200));
    } else {
      console.log("[notificar-cadastro] notificação enviada — %s", nome);
    }
  } catch (e) {
    console.error("[notificar-cadastro] exception:", e);
  }

  return OK;
});

// Escapa caracteres que o Markdown do Telegram interpreta, evitando erro de parse.
function escapar(v: unknown): string {
  return String(v ?? "").replace(/([_*[\]`])/g, "\\$1");
}
