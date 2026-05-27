import {
  Body,
  Container,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { object } from "zod/v4";

interface EmailTemplateProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailTemplate({ preview, children }: EmailTemplateProps) {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}

          {/* Content */}
          {children}

          <Section>
            <div className="w-[45px] h-[45px] flex justify-center items-center overflow-hidden relative">
              <Img
                src="https://FalconVest.live/images/logo1.png"
                alt="FalconVest"
                style={logo}
              />
            </div>

            {/* Footer */}
            <Text style={footer}>
              <Link
                href="https://FalconVest.live"
                target="_blank"
                style={footerLink}
              >
                FalconVest
              </Link>
              , the all-in-one crypto trading platform
              <br />
              for spot, futures, staking, and copy trading.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logo = {
  display: "block",
  width: "45px",
  height: "45px",
  object: "contain",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "32px",
  marginBottom: "24px",
};

const footerLink = {
  color: "#898989",
  fontSize: "12px",
  textDecoration: "underline",
};
