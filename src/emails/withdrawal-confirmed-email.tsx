import {
  Button,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface WithdrawalConfirmedEmailProps {
  name: string;
  amount: number;
  coin: string;
  address: string;
}

export default function WithdrawalConfirmedEmail({ 
  name, 
  amount, 
  coin,
  address 
}: WithdrawalConfirmedEmailProps) {
  return (
    <EmailTemplate preview="Withdrawal processed successfully">
      <Preview>Withdrawal processed successfully</Preview>

      <Text style={text}>Hi {name},</Text>
      <Text style={text}>
        Your withdrawal has been processed and the funds have been sent to your wallet.
      </Text>
      
      <Section style={statusBox}>
        <Text style={statusText}>✓ Withdrawal Confirmed</Text>
      </Section>

      <Section style={detailsBox}>
        <Text style={detailLabel}>Amount:</Text>
        <Text style={detailValue}>{amount} {coin}</Text>
        
        <Text style={detailLabel}>Destination Address:</Text>
        <Text style={addressText}>{address}</Text>
      </Section>

      <Text style={text}>
        Please allow some time for the transaction to be confirmed on the blockchain.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/withdraw`}
        >
          View Dashboard
        </Button>
      </Section>

      <Text style={signature}>FalconVest Team</Text>
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

const addressText = {
  color: "#0f172a",
  fontSize: "13px",
  fontFamily: "monospace",
  margin: "0 0 12px 0",
  padding: "12px",
  backgroundColor: "#f1f5f9",
  borderRadius: "6px",
  wordBreak: "break-all" as const,
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
