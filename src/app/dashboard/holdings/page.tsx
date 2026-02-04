import { Card, CardBody, CardHeader } from "@heroui/react";

export default function HoldingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Holdings</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Your Assets</h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-500">No assets yet</p>
        </CardBody>
      </Card>
    </div>
  );
}
