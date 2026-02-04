import { EmailTemplate } from "./email-template";

interface AdminLoginEmailProps {
  adminName: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export function AdminLoginEmail({ adminName, loginTime, ipAddress, userAgent }: AdminLoginEmailProps) {
  return (
    <EmailTemplate preview={`Admin login: ${adminName} at ${loginTime}`}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        Admin Login Alert
      </h2>
      <p style={{ marginBottom: "16px" }}>
        An admin user has logged into the control panel.
      </p>
      <div style={{ backgroundColor: "#f4f4f5", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
        <p style={{ margin: "8px 0" }}><strong>Admin:</strong> {adminName}</p>
        <p style={{ margin: "8px 0" }}><strong>Time:</strong> {loginTime}</p>
        {ipAddress && <p style={{ margin: "8px 0" }}><strong>IP Address:</strong> {ipAddress}</p>}
        {userAgent && <p style={{ margin: "8px 0" }}><strong>Device:</strong> {userAgent}</p>}
      </div>
      <p style={{ fontSize: "14px", color: "#666", marginTop: "16px" }}>
        If this wasn't you, please secure your account immediately.
      </p>
    </EmailTemplate>
  );
}
