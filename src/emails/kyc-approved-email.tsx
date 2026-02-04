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

interface KycApprovedEmailProps {
  name: string;
}

export default function KycApprovedEmail({ name }: KycApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your identity has been verified!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://ik.imagekit.io/v5jcj7s4p/20260203_232251.png"
            width="120"
            height="120"
            alt="MasterSync"
            style={logo}
          />
          <Heading style={h1}>✓ Verification Complete</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Great news! Your identity verification has been approved. You now have full access to all MasterSync features.
          </Text>
          <Section style={statusBox}>
            <Text style={statusText}>Status: Verified ✓</Text>
          </Section>
          <Text style={text}>
            You can now:
          </Text>
          <Text style={listItem}>• Trade cryptocurrencies</Text>
          <Text style={listItem}>• Deposit and withdraw funds</Text>
          <Text style={listItem}>• Access all premium features</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={process.env.NEXT_PUBLIC_APP_URL || "https://mastersync.live"}>
              Go to Dashboard
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
  backgroundColor: "#f0fdf4",
  border: "1px solid #22c55e",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "16px",
};

const statusText = {
  color: "#22c55e",
  fontSize: "16px",
  fontWeight: "600",
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
