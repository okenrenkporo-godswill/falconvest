import { Card, CardBody } from "@heroui/react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardBody className="prose dark:prose-invert max-w-none p-8">
            <h1>Privacy Policy</h1>
            <p className="text-default-600">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your name, email address,
              date of birth, country of residence, and government-issued identification documents
              for KYC verification.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              to process transactions, to send you technical notices and support messages, and
              to comply with legal obligations.
            </p>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as described
              in this policy or with your consent.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss,
              theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time
              by contacting us.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
