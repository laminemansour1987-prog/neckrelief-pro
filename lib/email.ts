// Provider-agnostic transactional email. If RESEND_API_KEY is set, emails are
// sent through Resend (https://resend.com); otherwise sending is a no-op that
// logs to the server console — so local dev and un-configured deploys never
// break. Every function swallows its own errors: a failed email must never
// break the signup flow.

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM = process.env.EMAIL_FROM || "Aura <onboarding@resend.dev>";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email] (no RESEND_API_KEY) would send "${subject}" to ${to}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status} for "${subject}"`);
    }
  } catch (error) {
    console.error("[email] send failed:", error);
  }
}

function welcomeHtml(): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0c0920;color:#f5f4ff;padding:40px 24px;">
    <div style="max-width:520px;margin:0 auto;">
      <p style="font-size:22px;font-weight:600;margin:0 0 8px;">Bienvenue sur Aura 🔮</p>
      <p style="color:#c9c2ff;line-height:1.6;margin:0 0 20px;">
        Votre compte est prêt. Aura est votre compagnon IA du quotidien : posez
        vos questions, et laissez-la vous rappeler de bouger et de prendre soin
        de vous au fil de la journée.
      </p>
      <p style="margin:0 0 28px;">
        <a href="${appUrl}/chat" style="display:inline-block;background:#ffffff;color:#0c0920;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:999px;">
          Discuter avec Aura
        </a>
      </p>
      <p style="color:#8b83b8;font-size:14px;line-height:1.6;margin:0;">
        Astuce : depuis votre espace compte, partagez votre lien de parrainage —
        chaque ami qui s'inscrit vous fait gagner en visibilité.
      </p>
      <p style="color:#544f7a;font-size:12px;margin:28px 0 0;">
        Vous recevez cet email car un compte Aura vient d'être créé avec cette
        adresse. Si ce n'est pas vous, ignorez ce message.
      </p>
    </div>
  </div>`;
}

/** Fire-and-forget welcome email. Never throws. */
export async function sendWelcomeEmail(to: string): Promise<void> {
  await send({
    to,
    subject: "Bienvenue sur Aura 🔮",
    html: welcomeHtml(),
  });
}
