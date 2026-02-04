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
} from "@react-email/components";

interface KycSubmittedEmailProps {
  name: string;
}

export default function KycSubmittedEmail({ name }: KycSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your identity verification has been submitted</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://ik.imagekit.io/v5jcj7s4p/20260203_232251.png"
            width="120"
            height="120"
            alt="MasterSync"
            style={logo}
          />
          <Heading style={h1}>Verification Submitted</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for completing your identity verification. We've received your documents and are reviewing them now.
          </Text>
          <Section style={statusBox}>
            <Text style={statusText}>Status: Under Review</Text>
          </Section>
          <Text style={text}>
            You'll receive an email once your verification is complete. This typically takes a few minutes for automatic approvals, or up to 24 hours for manual reviews.
          </Text>
          <Text style={text}>
            In the meantime, you can access your dashboard with limited features.
          </Text>
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

const statusBox = {
  backgroundColor: "#f0f9ff",
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
