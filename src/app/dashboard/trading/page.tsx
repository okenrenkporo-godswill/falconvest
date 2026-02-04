import { Card, CardBody, CardHeader } from "@heroui/react";

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Terminal</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardBody className="flex items-center justify-center">
              <p className="text-default-600">TradingView Chart Widget (Integration Required)</p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Place Order</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-default-600">Order panel coming soon</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Order Book</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-default-600">Order book coming soon</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
