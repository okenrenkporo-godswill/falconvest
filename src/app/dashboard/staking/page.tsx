import { Card, CardBody, CardHeader } from "@heroui/react";

export default function StakingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staking</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Available Pools</h3>
          </CardHeader>
          <CardBody>
            <p className="text-default-600">Staking pools coming soon</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Your Stakes</h3>
          </CardHeader>
          <CardBody>
            <p className="text-default-600">No active stakes</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
