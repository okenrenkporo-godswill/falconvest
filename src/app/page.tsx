import { Button } from "@heroui/react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MasterSync</h1>
          <div className="flex gap-4">
            <Button as={Link} href="/login" variant="light">
              Login
            </Button>
            <Button as={Link} href="/register" color="primary">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">
            Professional Crypto Trading Platform
          </h2>
          <p className="text-xl text-default-600">
            Trade spot & futures, stake your assets, and copy top traders all in one secure platform
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button as={Link} href="/register" color="primary" size="lg">
              Get Started
            </Button>
            <Button as={Link} href="/login" variant="bordered" size="lg">
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
              <p className="text-default-600">Bank-level security with 2FA and cold storage</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
              <p className="text-default-600">Competitive trading fees starting at 0.1%</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-default-600">Round-the-clock customer support</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
