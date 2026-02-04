import {
  Button,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  return (
    <EmailTemplate preview="Welcome to MasterSync - Complete Your KYC Verification">
      <Preview>Welcome to MasterSync - Complete Your KYC Verification</Preview>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        Thank you for creating your MasterSync account. We're excited to have
        you join our crypto trading platform!
      </Text>

      <Text style={paragraph}>
        Your account has been successfully created with the email:{" "}
        <strong>{email}</strong>
      </Text>

      <Section style={alertBox}>
        <Text style={alertText}>
          <strong>⚠️ Important: Complete Your KYC Verification</strong>
        </Text>
        <Text style={alertText}>
          To start trading, you need to complete your KYC (Know Your Customer)
          verification by uploading a government-issued ID.
        </Text>
      </Section>

      <Text style={paragraph}>
        <strong>What's next?</strong>
      </Text>

      <Text style={listItem}>1. Log in to your dashboard</Text>
      <Text style={listItem}>
        2. Upload your government-issued ID (passport, driver's license, or
        national ID)
      </Text>
      <Text style={listItem}>
        3. Wait for verification (usually within 24 hours)
      </Text>
      <Text style={listItem}>4. Start trading!</Text>

      <Text style={paragraph}>
        If you have any questions or need assistance, please don't hesitate to
        contact our support team.
      </Text>

      <Text style={paragraph}>
        Best regards,
        <br />
        The MasterSync Team
      </Text>

      <Text style={disclaimer}>
        This email was sent to {email}. If you didn't create this account,
        please ignore this email.
      </Text>
    </EmailTemplate>
  );
}

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
};

const listItem = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "8px",
  marginLeft: "16px",
};

const alertBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  marginTop: "24px",
};

const alertText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#92400e",
  margin: "0 0 8px 0",
};

const disclaimer = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#8898aa",
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #e6ebf1",
};
