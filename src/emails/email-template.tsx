import {
  Body,
  Container,
  Html,
  Img,
  Link,
  Text,
} from "@react-email/components";

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
          <Img
            src="https://ik.imagekit.io/v5jcj7s4p/20260203_232251.png"
            width="80"
            height="80"
            alt="MasterSync"
            style={logo}
          />

          {/* Content */}
          {children}

          {/* Footer */}
          <Text style={footer}>
            <Link
              href="https://mastersync.live"
              target="_blank"
              style={footerLink}
            >
              MasterSync
            </Link>
            , the all-in-one crypto trading platform
            <br />
            for spot, futures, staking, and copy trading.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logo = {
  margin: "0 auto 32px",
  display: "block",
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
