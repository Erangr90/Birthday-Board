

import { logEmailOperation } from "./analytics";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";


function buildVerificationEmailHtml(toName: string, code: string): string {
  const safeName = toName;

  return `
    <div style="background-color:#f4f6f8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background-color:#558cbd;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">Birthday Board &#128081;</h1>
        </div>
        <div style="padding:32px;color:#333333;">
          <p style="margin:0 0 16px;font-size:16px;">Hello ${safeName},</p>
          <p style="margin:0 0 16px;font-size:16px;">Use the verification code below to finish creating your account:</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="display:inline-block;background-color:#eef3f8;color:#2f5d8a;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 24px;border-radius:12px;">${code}</span>
          </div>
          <p style="margin:0;font-size:14px;color:#777777;">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendVerificationCodeEmail(
  toEmail: string,
  toName: string,
  code: string
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Birthday Board";

  if (!apiKey || !senderEmail) {
    throw new Error("Email service is not configured");
  }

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: toEmail, name: toName }],
    subject: "Your Birthday Board verification code",
    htmlContent: buildVerificationEmailHtml(toName, code)
  };

  try {
    const response = await fetch(BREVO_EMAIL_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Brevo responded with status ${response.status}`);
    }

    logEmailOperation("verification_email_sent", "success");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    logEmailOperation("verification_email_sent", "failure", {
      errorMessage: message
    });
    throw new Error("Failed to send verification email");
  }
}

const EMAIL_MAX_RETRIES = 2;
const EMAIL_RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function sendVerificationCodeEmailWithRetry(
  toEmail: string,
  toName: string,
  code: string
): Promise<void> {
  for (let attempt = 0; attempt <= EMAIL_MAX_RETRIES; attempt++) {
    try {
      await sendVerificationCodeEmail(toEmail, toName, code);
      return;
    } catch (error: unknown) {
      if (attempt === EMAIL_MAX_RETRIES) {
        throw error;
      }

      await delay(EMAIL_RETRY_DELAY_MS * (attempt + 1));
    }
  }
}
