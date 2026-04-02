import {
  Button,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface WithdrawalRejectedEmailProps {
  name: string;
  amount: number;
  coin: string;
  reason?: string;
}

export default function WithdrawalRejectedEmail({ 
  name, 
  amount, 
  coin,
  reason 
}: WithdrawalRejectedEmailProps) {
  return (
    <EmailTemplate preview="Withdrawal request declined">
      <Preview>Withdrawal request declined</Preview>

      <Text style={text}>Hi {name},</Text>
      <Text style={text}>
        We were unable to process your withdrawal request. Please review the details below.
      </Text>
      
      <Section style={statusBox}>
        <Text style={statusText}>⚠ Withdrawal Declined</Text>
      </Section>

      <Section style={detailsBox}>
        <Text style={detailLabel}>Amount:</Text>
        <Text style={detailValue}>{amount} {coin}</Text>
        
        {reason && (
          <>
            <Text style={detailLabel}>Reason:</Text>
            <Text style={reasonText}>{reason}</Text>
          </>
        )}
      </Section>

      <Text style={text}>
        If you believe this is an error or need assistance, please contact our support team.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/withdraw`}
        >
          Submit New Request
        </Button>
      </Section>

      <Text style={signature}>SyncTrade Team</Text>
    </EmailTemplate>
  );
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const statusBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
  textAlign: "center" as const,
};

const statusText = {
  color: "#ef4444",
  fontSize: "18px",
  fontWeight: "600",
  margin: 0,
};

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "20px",
};

const detailLabel = {
  color: "#64748b",
  fontSize: "14px",
  margin: "8px 0 4px 0",
  fontWeight: "500",
};

const detailValue = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const reasonText = {
  color: "#ef4444",
  fontSize: "14px",
  margin: "0 0 12px 0",
  padding: "12px",
  backgroundColor: "#fef2f2",
  borderRadius: "6px",
};

const buttonContainer = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#0ea5e9",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const signature = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};
