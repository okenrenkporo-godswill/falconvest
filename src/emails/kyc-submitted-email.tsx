import { Heading, Preview, Section, Text } from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface KycSubmittedEmailProps {
  name: string;
}

export default function KycSubmittedEmail({ name }: KycSubmittedEmailProps) {
  return (
    <EmailTemplate preview="Your identity verification has been submitted">
      <Preview>Your identity verification has been submitted</Preview>

      <Text style={text}>Hi {name},</Text>
      <Text style={text}>
        Thank you for completing your identity verification. We've received your
        documents and are reviewing them now.
      </Text>
      <Section style={statusBox}>
        <Text style={statusText}>Status: Under Review</Text>
      </Section>
      <Text style={text}>What happens next:</Text>
      <Text style={listItem}>• Our team will review your documents</Text>
      <Text style={listItem}>
        • You'll receive an email once the review is complete
      </Text>
      <Text style={listItem}>• This usually takes 24-48 hours</Text>
      <Text style={text}>
        If we need any additional information, we'll reach out to you.
      </Text>
      <Text style={signature}>SyncTrade Team</Text>
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

const statusBox = {
  backgroundColor: "#eff6ff",
  border: "1px solid #0ea5e9",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
};

const statusText = {
  color: "#0ea5e9",
  fontSize: "16px",
  fontWeight: "600",
  margin: 0,
};

const signature = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};
