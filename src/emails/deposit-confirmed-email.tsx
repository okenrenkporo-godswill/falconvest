import {
  Button,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface DepositConfirmedEmailProps {
  name: string;
  amount: number;
  coin: string;
  accountType: string;
}

export default function DepositConfirmedEmail({ 
  name, 
  amount, 
  coin,
  accountType 
}: DepositConfirmedEmailProps) {
  return (
    <EmailTemplate preview="Your deposit has been confirmed!">
      <Preview>Your deposit has been confirmed!</Preview>

      <Text style={text}>Hi {name},</Text>
      <Text style={text}>
        Great news! Your deposit has been confirmed and credited to your account.
      </Text>
      
      <Section style={statusBox}>
        <Text style={statusText}>✓ Deposit Confirmed</Text>
      </Section>

      <Section style={detailsBox}>
        <Text style={detailLabel}>Amount:</Text>
        <Text style={detailValue}>{amount} {coin}</Text>
        
        <Text style={detailLabel}>Account:</Text>
        <Text style={detailValue}>{accountType}</Text>
      </Section>

      <Text style={text}>
        Your funds are now available and you can start trading immediately.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
        >
          View Dashboard
        </Button>
      </Section>

      <Text style={signature}>MasterSync Team</Text>
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
  backgroundColor: "#f0fdf4",
  border: "1px solid #22c55e",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
  textAlign: "center" as const,
};

const statusText = {
  color: "#22c55e",
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
