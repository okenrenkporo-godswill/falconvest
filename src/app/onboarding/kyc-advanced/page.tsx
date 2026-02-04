"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function AdvancedKycPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
          <p className="text-sm text-default-500">4 steps • 3 minutes</p>
        </div>

        <Card shadow="none" className="border mb-6">
          <CardBody className="p-5">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-default-400">1</span>
                <span>Capture ID document</span>
              </div>
              <div className="flex gap-3">
                <span className="text-default-400">2</span>
                <span>Review details</span>
              </div>
              <div className="flex gap-3">
                <span className="text-default-400">3</span>
                <span>Take selfie</span>
              </div>
              <div className="flex gap-3">
                <span className="text-default-400">4</span>
                <span>Complete</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border mb-6">
          <CardBody className="p-5">
            <h3 className="text-sm font-medium mb-3">Requirements</h3>
            <div className="space-y-2 text-sm text-default-600">
              <div>• Government ID</div>
              <div>• Good lighting</div>
              <div>• Camera access</div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="bordered"
            onPress={() => router.push("/dashboard")}
            className="flex-1"
          >
            Later
          </Button>
          <Button
            color="primary"
            onPress={() => router.push("/onboarding/kyc-advanced/capture")}
            className="flex-1"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
