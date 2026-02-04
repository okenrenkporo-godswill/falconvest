import { Card, CardBody, CardHeader } from "@heroui/react";

export default function WithdrawalPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Withdrawal</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Crypto Withdrawal</h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-600">Withdrawal functionality coming soon</p>
        </CardBody>
      </Card>
    </div>
  );
}
