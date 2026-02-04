import { Resend } from "resend";
import { env } from "@/env";
import OtpEmail from "@/emails/otp-email";
import WelcomeEmail from "@/emails/welcome-email";
import KycSubmittedEmail from "@/emails/kyc-submitted-email";
import KycApprovedEmail from "@/emails/kyc-approved-email";
import KycRejectedEmail from "@/emails/kyc-rejected-email";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "MasterSync <onboarding@mastersync.live>",
    to: email,
    subject: "Your MasterSync verification code",
    react: OtpEmail({ code }),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "MasterSync <welcome@mastersync.live>",
    to: email,
    subject: "Welcome to MasterSync - Complete Your KYC",
    react: WelcomeEmail({ name, email }),
  });
}

export async function sendKycSubmittedEmail(email: string, name: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "MasterSync <kyc@mastersync.live>",
    to: email,
    subject: "Identity Verification Submitted",
    react: KycSubmittedEmail({ name }),
  });
}

export async function sendKycApprovedEmail(email: string, name: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "MasterSync <kyc@mastersync.live>",
    to: email,
    subject: "✓ Identity Verified - Welcome to MasterSync",
    react: KycApprovedEmail({ name }),
  });
}

export async function sendKycRejectedEmail(email: string, name: string, reason?: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "MasterSync <kyc@mastersync.live>",
    to: email,
    subject: "Action Required: Identity Verification",
    react: KycRejectedEmail({ name, reason }),
  });
}
