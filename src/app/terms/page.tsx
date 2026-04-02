import { Card, CardBody } from "@heroui/react";

export default function TermsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardBody className="prose dark:prose-invert max-w-none p-8">
            <h1>Terms & Conditions</h1>
            <p className="text-default-600">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using SyncTrade, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use SyncTrade for personal, non-commercial
              transitory viewing only.
            </p>

            <h2>3. Trading Risks</h2>
            <p>
              Cryptocurrency trading involves substantial risk of loss. You should carefully
              consider whether trading is appropriate for you in light of your experience,
              objectives, financial resources, and other relevant circumstances.
            </p>

            <h2>4. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password
              and for restricting access to your computer.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
