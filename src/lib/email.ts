import { Resend } from "resend";
import { env } from "@/env";
import OtpEmail from "@/emails/otp-email";
import WelcomeEmail from "@/emails/welcome-email";
import KycSubmittedEmail from "@/emails/kyc-submitted-email";
import KycApprovedEmail from "@/emails/kyc-approved-email";
import KycRejectedEmail from "@/emails/kyc-rejected-email";
import { AdminLoginEmail } from "@/emails/admin-login-email";
import DepositConfirmedEmail from "@/emails/deposit-confirmed-email";
import DepositRejectedEmail from "@/emails/deposit-rejected-email";
import WithdrawalConfirmedEmail from "@/emails/withdrawal-confirmed-email";
import WithdrawalRejectedEmail from "@/emails/withdrawal-rejected-email";

const resend = new Resend(env.RESEND_API_KEY || "re_placeholder_for_build_purposes");

const ADMIN_EMAIL = "info@falconvest.live";

// Admin notification helper
async function sendAdminNotification(subject: string, html: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping admin notification");
    return;
  }

  try {
    const result = await resend.emails.send({
      from: "Falcon Alerts <info@falconvest.live>",
      to: ADMIN_EMAIL,
      subject: `[Admin Alert] ${subject}`,
      html,
    });
    console.log("Admin notification sent successfully:", result);
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    throw error; // Re-throw to see the actual error
  }
}

export async function sendOtpEmail(email: string, code: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured, skipping email.");
    console.log(`🔑 [DEVELOPMENT ONLY] Verification code for ${email} is: ${code}`);
    return;
  }

  await resend.emails.send({
    from: "Falcon <info@falconvest.live>",
    to: email,
    subject: "Your Falcon verification code",
    react: OtpEmail({ code }),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <info@falconvest.live>",
    to: email,
    subject: "Welcome to Falcon - Complete Your KYC",
    react: WelcomeEmail({ name, email }),
  });
}

export async function sendKycSubmittedEmail(email: string, name: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <info@falconvest.live>",
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
    from: "Falcon <info@falconvest.live>",
    to: email,
    subject: "✓ Identity Verified - Welcome to Falcon",
    react: KycApprovedEmail({ name }),
  });
}

export async function sendKycRejectedEmail(
  email: string,
  name: string,
  reason?: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <info@falconvest.live>",
    to: email,
    subject: "Action Required: Identity Verification",
    react: KycRejectedEmail({ name, reason }),
  });
}

export async function sendAdminLoginEmail(
  email: string,
  adminName: string,
  ipAddress?: string,
  userAgent?: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const loginTime = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  await resend.emails.send({
    from: "Falcon <security@falconvest.live>",
    to: email,
    subject: "🔐 Admin Login Alert - Falcon",
    react: AdminLoginEmail({ adminName, loginTime, ipAddress, userAgent }),
  });
}

export async function sendDepositConfirmedEmail(
  email: string,
  name: string,
  amount: number,
  coin: string,
  accountType: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <deposits@falconvest.live>",
    to: email,
    subject: "✓ Deposit Confirmed - Funds Available",
    react: DepositConfirmedEmail({ name, amount, coin, accountType }),
  });
}

export async function sendDepositRejectedEmail(
  email: string,
  name: string,
  amount: number,
  coin: string,
  reason?: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <deposits@falconvest.live>",
    to: email,
    subject: "Action Required: Deposit Verification",
    react: DepositRejectedEmail({ name, amount, coin, reason }),
  });
}

export async function sendWithdrawalConfirmedEmail(
  email: string,
  name: string,
  amount: number,
  coin: string,
  address: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <withdrawals@falconvest.live>",
    to: email,
    subject: "✓ Withdrawal Processed Successfully",
    react: WithdrawalConfirmedEmail({ name, amount, coin, address }),
  });
}

export async function sendWithdrawalRejectedEmail(
  email: string,
  name: string,
  amount: number,
  coin: string,
  reason?: string,
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Falcon <withdrawals@falconvest.live>",
    to: email,
    subject: "Withdrawal Request Declined",
    react: WithdrawalRejectedEmail({ name, amount, coin, reason }),
  });
}

// Admin Notifications
export async function notifyAdminUserLogin(
  userEmail: string,
  userName: string,
) {
  await sendAdminNotification(
    "User Login",
    `<p><strong>User logged in:</strong></p>
    <p>Name: ${userName}</p>
    <p>Email: ${userEmail}</p>
    <p>Time: ${new Date().toLocaleString()}</p>`,
  );
}

export async function notifyAdminNewAccount(
  userEmail: string,
  userName: string,
) {
  await sendAdminNotification(
    "New Account Created",
    `<p><strong>New user registered:</strong></p>
    <p>Name: ${userName}</p>
    <p>Email: ${userEmail}</p>
    <p>Time: ${new Date().toLocaleString()}</p>`,
  );
}

export async function notifyAdminKycSubmission(
  userEmail: string,
  userName: string,
) {
  await sendAdminNotification(
    "New KYC Submission",
    `<p><strong>New KYC verification submitted:</strong></p>
    <p>Name: ${userName}</p>
    <p>Email: ${userEmail}</p>
    <p>Time: ${new Date().toLocaleString()}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/cpanel/kyc-pending">Review KYC Submissions</a></p>`,
  );
}

export async function notifyAdminDeposit(
  userEmail: string,
  amount: number,
  asset: string,
) {
  await sendAdminNotification(
    "New Deposit Request",
    `<p><strong>User submitted deposit:</strong></p>
    <p>Email: ${userEmail}</p>
    <p>Amount: ${amount} ${asset}</p>
    <p>Time: ${new Date().toLocaleString()}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://falconvest.live"}/cpanel/deposits">Review Deposits</a></p>`,
  );
}

export async function notifyAdminWithdrawal(
  userEmail: string,
  amount: number,
  asset: string,
) {
  await sendAdminNotification(
    "New Withdrawal Request",
    `<p><strong>User requested withdrawal:</strong></p>
    <p>Email: ${userEmail}</p>
    <p>Amount: ${amount} ${asset}</p>
    <p>Time: ${new Date().toLocaleString()}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://falconvest.live"}/cpanel/withdrawals">Review Withdrawals</a></p>`,
  );
}

export async function notifyAdminStake(
  userEmail: string,
  amount: number,
  asset: string,
  pool: string,
) {
  await sendAdminNotification(
    "New Stake",
    `<p><strong>User staked assets:</strong></p>
    <p>Email: ${userEmail}</p>
    <p>Amount: ${amount} ${asset}</p>
    <p>Pool: ${pool}</p>
    <p>Time: ${new Date().toLocaleString()}</p>`,
  );
}

export async function notifyAdminTrade(
  userEmail: string,
  pair: string,
  side: string,
  amount: number,
  total: number,
) {
  await sendAdminNotification(
    "New Trade",
    `<p><strong>User executed trade:</strong></p>
    <p>Email: ${userEmail}</p>
    <p>Pair: ${pair}</p>
    <p>Side: ${side.toUpperCase()}</p>
    <p>Amount: ${amount}</p>
    <p>Total: $${total.toFixed(2)}</p>
    <p>Time: ${new Date().toLocaleString()}</p>`,
  );
}

export async function notifyAdminCopyTrade(
  userEmail: string,
  traderName: string,
  amount: number,
) {
  await sendAdminNotification(
    "New Copy Trade",
    `<p><strong>User started copy trading:</strong></p>
    <p>Email: ${userEmail}</p>
    <p>Trader: ${traderName}</p>
    <p>Amount: $${amount.toFixed(2)}</p>
    <p>Time: ${new Date().toLocaleString()}</p>`,
  );
}

export async function sendCopyTradeResultEmail(
  email: string,
  name: string,
  traderName: string,
  pair: string,
  outcome: "profit" | "loss",
) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const subject = outcome === "profit"
    ? "✓ Copy Trade Closed - Profitable"
    : "Copy Trade Closed";

  await resend.emails.send({
    from: "Falcon <trading@falconvest.live>",
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Copy Trade Update</h2>
        <p>Hi ${name},</p>
        <p>A trade from <strong>${traderName}</strong> has been closed.</p>
        <p><strong>Trading Pair:</strong> ${pair}</p>
        <p>Your account balance has been updated. Log in to your dashboard to view the details.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://falconvest.live"}/dashboard/my-copy-trades" 
             style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View My Copy Trades Now
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from Falcon.
        </p>
      </div>
    `,
  });
}
