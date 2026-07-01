"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, RadioGroup, Radio, addToast } from "@heroui/react";
import { Cpu, Check, AlertTriangle, ShieldAlert, Wifi, ShieldCheck, PlayCircle, PauseCircle } from "lucide-react";
import { activateBotPlan } from "@/actions/bot";
import { useRouter } from "next/navigation";

type BotPlan = {
  id: string;
  plan_type: "silver" | "gold" | "diamond";
  price: number;
  is_active: boolean;
  status: "inactive" | "active" | "paused";
};

interface BotPlansClientProps {
  botPlans: BotPlan[];
  botRestrictionActive: boolean;
  vpsStatus: string;
}

export function BotPlansClient({ botPlans, botRestrictionActive, vpsStatus }: BotPlansClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<BotPlan | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAsset, setPaymentAsset] = useState<"USDT" | "BTC">("USDT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planFeatures = {
    silver: {
      name: "Silver Bot Plan",
      gradient: "from-slate-400 to-slate-200",
      accentColor: "border-slate-300 shadow-slate-100 dark:shadow-none",
      textColor: "text-slate-400",
      yield: "Up to 1.5% Daily Yield",
      minBal: "$1,000 suggested minimum",
      bulletPoints: [
        "Automated Trend-Following Algorithm",
        "Standard Signal Alerts (1-3 daily)",
        "Email Support",
        "Standard Risk Control Settings",
      ],
    },
    gold: {
      name: "Gold Bot Plan",
      gradient: "from-amber-500 via-yellow-400 to-amber-300",
      accentColor: "border-amber-400 shadow-amber-100 dark:shadow-none",
      textColor: "text-amber-500",
      yield: "Up to 2.5% Daily Yield",
      minBal: "$5,000 suggested minimum",
      bulletPoints: [
        "Advanced Momentum & Mean-Reversion Algorithm",
        "High-Frequency Signals (5-10 daily)",
        "Priority Support & Setup Guidance",
        "VPS Node Access Integration",
        "Custom Drawdown Protection Safeguards",
      ],
    },
    diamond: {
      name: "Diamond Bot Plan",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      accentColor: "border-cyan-400 shadow-cyan-100 dark:shadow-none",
      textColor: "text-cyan-500",
      yield: "Up to 4.0% Daily Yield",
      minBal: "$10,000 suggested minimum",
      bulletPoints: [
        "AI-Driven Multi-Strategy Portfolio Bot",
        "Unlimited Real-Time Signals",
        "24/7 Dedicated Support Hotline",
        "Free High-Performance Dedicated VPS Node",
        "Custom Arbitrage & Leverage Customization",
        "Exclusive VIP Discord Access & Market Reports",
      ],
    },
  };

  const handleOpenPayModal = (plan: BotPlan) => {
    setSelectedPlan(plan);
    setIsPayModalOpen(true);
  };

  const handleActivate = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      const result = await activateBotPlan(selectedPlan.plan_type, paymentAsset);
      if (result.error) {
        addToast({ title: "Activation Failed", description: result.error, color: "danger" });
      } else {
        addToast({ title: "Success", description: `${planFeatures[selectedPlan.plan_type].name} is now active!`, color: "success" });
        setIsPayModalOpen(false);
        window.location.reload();
      }
    } catch {
      addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* Page Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 text-white p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Cpu size={14} /> Algo Trading Systems
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Trading Bot Plans</h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
            Subscribe to automated trading nodes tailored directly to your investment scope. Our trading bots run round-the-clock using customized high-probability quantitative logic.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl" />
      </div>

      {/* Restriction Alert Banner if user has restrictions */}
      {(botRestrictionActive || vpsStatus === "expired") && (
        <AlertTriangle className="hidden" />
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {botPlans.map((plan) => {
          const features = planFeatures[plan.plan_type];
          const isPlanActive = plan.status === "active";
          const isPlanPaused = plan.status === "paused";

          return (
            <Card
              key={plan.id}
              className={`border-2 ${plan.status === 'active' ? features.accentColor : 'border-default-100'} bg-background/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-lg transition-transform duration-300 hover:scale-[1.02]`}
            >
              <CardHeader className="flex flex-col items-start gap-1 p-6 pb-4">
                <div className="flex justify-between items-center w-full">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${features.textColor}`}>
                    {plan.plan_type} PLAN
                  </span>
                  {isPlanActive && (
                    <Chip size="sm" color="success" startContent={<ShieldCheck size={12} className="mr-1" />}>
                      Active
                    </Chip>
                  )}
                  {isPlanPaused && (
                    <Chip size="sm" color="warning" startContent={<PauseCircle size={12} className="mr-1" />}>
                      Paused
                    </Chip>
                  )}
                </div>
                <h3 className="text-xl font-bold mt-2">{features.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold">${Number(plan.price).toLocaleString()}</span>
                  <span className="text-xs text-default-500">one-time</span>
                </div>
                <div className="w-full h-px bg-default-100 dark:bg-zinc-800 my-3" />
              </CardHeader>
              <CardBody className="px-6 py-0 pb-6 flex flex-col justify-between h-[300px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-success-600 dark:text-success-400">{features.yield}</p>
                    <p className="text-xs text-default-400 mt-0.5">{features.minBal}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {features.bulletPoints.map((pt, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-default-600 dark:text-default-300">
                        <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {isPlanActive ? (
                    <Button
                      color="success"
                      variant="flat"
                      className="w-full font-bold"
                      isDisabled
                      startContent={<ShieldCheck size={16} />}
                    >
                      Plan is Active
                    </Button>
                  ) : isPlanPaused ? (
                    <Button
                      color="warning"
                      variant="flat"
                      className="w-full font-bold"
                      isDisabled
                    >
                      Plan is Paused
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      className="w-full font-bold bg-[#33525c] text-white hover:bg-[#2a4550]"
                      onPress={() => router.push(`/dashboard/deposit?amount=${plan.price}&wallet=trading`)}
                    >
                      Subscribe & Activate
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Payment Confirmation Modal */}
      {selectedPlan && (
        <Modal isOpen={isPayModalOpen} onOpenChange={setIsPayModalOpen} size="md" backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="font-bold text-xl">Confirm Plan Purchase</ModalHeader>
                <ModalBody className="space-y-4">
                  <p className="text-sm text-default-500">
                    You are purchasing the <strong>{planFeatures[selectedPlan.plan_type].name}</strong> for <strong>${selectedPlan.price.toLocaleString()}</strong>. Select your payment asset balance:
                  </p>
                  <RadioGroup
                    label="Payment Balance"
                    value={paymentAsset}
                    onValueChange={(val: any) => setPaymentAsset(val)}
                  >
                    <Radio value="USDT">USDT Trading Account Balance</Radio>
                    <Radio value="BTC">BTC Trading Account Balance (auto-converted to USD price)</Radio>
                  </RadioGroup>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>Cancel</Button>
                  <Button
                    color="primary"
                    className="bg-[#33525c] text-white font-bold"
                    onPress={handleActivate}
                    isLoading={isSubmitting}
                  >
                    Confirm & Activate
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
