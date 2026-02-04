import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface KycRejectedEmailProps {
  name: string;
  reason?: string;
}

export default function KycRejectedEmail({ name, reason }: KycRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Action required: Identity verification needs attention</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://ik.imagekit.io/v5jcj7s4p/20260203_232251.png"
            width="120"
            height="120"
            alt="MasterSync"
            style={logo}
          />
          <Heading style={h1}>Verification Needs Attention</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            We were unable to verify your identity with the documents provided.
          </Text>
          {reason && (
            <Section style={statusBox}>
              <Text style={statusLabel}>Reason:</Text>
              <Text style={statusText}>{reason}</Text>
            </Section>
          )}
          <Text style={text}>
            Please submit new documents with:
          </Text>
          <Text style={listItem}>• Clear, well-lit photos</Text>
          <Text style={listItem}>• All text readable</Text>
          <Text style={listItem}>• Valid, unexpired documents</Text>
          <Text style={listItem}>• Your face clearly visible in selfie</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL || "https://mastersync.live"}/onboarding/kyc-advanced`}>
              Try Again
            </Button>
          </Section>
          <Text style={footer}>
            MasterSync Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

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
  backgroundColor: "#fef2f2",
  border: "1px solid #ef4444",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
};

const statusLabel = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const statusText = {
  color: "#dc2626",
  fontSize: "16px",
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

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};

const logo = {
  margin: "0 auto 24px",
  display: "block",
};
