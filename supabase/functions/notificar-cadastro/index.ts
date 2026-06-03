// notificar-cadastro — envia um e-mail a cada novo cadastro.
// Acionada por um Database Webhook do Supabase (INSERT na tabela `perfis`).
// Deploy com --no-verify-jwt (o webhook do Supabase não envia JWT de usuário).
//
// Variáveis de ambiente necessárias (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  → chave da API do Resend (resend.com → API Keys)
//   NOTIFY_EMAIL    → e-mail que vai RECEBER os avisos (o seu)
//   NOTIFY_FROM     → (opcional) remetente; padrão: onboarding@resend.dev
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OK = new Response("ok", { status: 200 });

serve(async (req) => {
  if (req.method === "OPTIONS") return OK;
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const para   = Deno.env.get("NOTIFY_EMAIL");
    const de     = Deno.env.get("NOTIFY_FROM") || "Controle IATF <onboarding@resend.dev>";
    if (!apiKey || !para) {
      console.error("[notificar-cadastro] RESEND_API_KEY ou NOTIFY_EMAIL ausente");
      return OK; // não falha o webhook
    }

    const body = await req.json().catch(() => ({}));
    // Database Webhook envia: { type, table, record, old_record }
    const r = body?.record ?? body ?? {};

    const nome     = [r.nome, r.sobrenome].filter(Boolean).join(" ").trim() || "(sem nome)";
    const email    = r.email || "(sem e-mail)";
    const whatsapp = r.whatsapp || "(sem telefone)";
    const cpf      = r.cpf || "—";
    const cidade   = [r.cidade, r.uf].filter(Boolean).join("/") || "—";

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.6">
        <h2 style="margin:0 0 12px">🎉 Novo cadastro no Controle IATF</h2>
        <table cellpadding="4" style="font-size:15px">
          <tr><td><b>Nome:</b></td><td>${esc(nome)}</td></tr>
          <tr><td><b>WhatsApp:</b></td><td>${esc(whatsapp)}</td></tr>
          <tr><td><b>E-mail:</b></td><td>${esc(email)}</td></tr>
          <tr><td><b>CPF:</b></td><td>${esc(cpf)}</td></tr>
          <tr><td><b>Cidade:</b></td><td>${esc(cidade)}</td></tr>
        </table>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: de,
        to: [para],
        subject: `🎉 Novo cadastro: ${nome}`,
        html,
      }),
    });

    if (!res.ok) {
      const erro = await res.text().catch(() => "");
      console.error("[notificar-cadastro] Resend http=%s %s", res.status, erro.slice(0, 300));
    } else {
      console.log("[notificar-cadastro] e-mail enviado — %s", nome);
    }
  } catch (e) {
    console.error("[notificar-cadastro] exception:", e);
  }

  return OK;
});

function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
