import {
  Button,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface KycRejectedEmailProps {
  name: string;
  reason?: string;
}

export default function KycRejectedEmail({
  name,
  reason,
}: KycRejectedEmailProps) {
  return (
    <EmailTemplate preview="Action required: Identity verification needs attention">
      <Preview>Action required: Identity verification needs attention</Preview>

      <Text style={text}>Hi {name},</Text>
      <Text style={text}>
        We were unable to verify your identity with the documents provided.
      </Text>
      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonTitle}>Reason:</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}
      <Text style={text}>
        Please submit new documents to complete your verification. Make sure
        your documents are:
      </Text>
      <Text style={listItem}>• Clear and readable</Text>
      <Text style={listItem}>• Valid and not expired</Text>
      <Text style={listItem}>• Government-issued</Text>
      <Text style={listItem}>• Show your full name and photo</Text>
      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`${process.env.NEXT_PUBLIC_APP_URL || "https://mastersync.live"}/onboarding/kyc`}
        >
          Resubmit Documents
        </Button>
      </Section>
      <Text style={signature}>MasterSync Team</Text>
    </EmailTemplate>
  );
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const listItem = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px 0 60px",
  margin: "4px 0",
};

const reasonBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
};

const reasonTitle = {
  color: "#ef4444",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const reasonText = {
  color: "#991b1b",
  fontSize: "14px",
  margin: 0,
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
