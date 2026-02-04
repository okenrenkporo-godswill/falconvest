import {
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailTemplate } from "./email-template";

interface OtpEmailProps {
  code: string;
}

export default function OtpEmail({ code }: OtpEmailProps) {
  return (
    <EmailTemplate preview={`Your MasterSync verification code: ${code}`}>
      <Preview>Your MasterSync verification code: {code}</Preview>
      
      <Heading style={h1}>MasterSync</Heading>
          <Text style={text}>Your verification code is:</Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </Text>
          <Text style={footer}>
            © 2026 MasterSync. All rights reserved.
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
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 30px",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const codeContainer = {
  background: "#f4f4f5",
  borderRadius: "8px",
  margin: "32px 0",
  padding: "24px",
  textAlign: "center" as const,
};

const codeText = {
  color: "#1a1a1a",
  fontSize: "48px",
  fontWeight: "bold",
  letterSpacing: "8px",
  lineHeight: "1",
  margin: "0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 24px",
  display: "block",
};
