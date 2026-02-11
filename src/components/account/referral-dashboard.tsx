"use client";

import { Card, CardBody, Button, Input } from "@heroui/react";
import { Users, Copy, Gift, TrendingUp } from "lucide-react";

export function ReferralDashboard() {
    return (
        <Card className="border-none shadow-md dark:bg-zinc-900">
             <CardBody className="p-0 overflow-hidden">
                {/* Hero */}
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                         <h3 className="text-2xl font-bold mb-2">Invite Friends, Earn 20%</h3>
                         <p className="text-blue-200 text-sm max-w-sm mb-6">Earn up to 20% commission on every trade your friends make. Payouts are instant to your Funding Wallet.</p>
                         <div className="flex gap-3">
                             <Button size="sm" color="warning" variant="solid" className="font-bold text-black" startContent={<Gift size={16} />}>
                                 Invite Now
                             </Button>
                         </div>
                    </div>
                     <Gift className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48 rotate-12" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 divide-x divide-default-100 dark:divide-white/10 p-6">
                    <div className="flex flex-col gap-1 px-4">
                        <span className="text-default-500 text-xs uppercase font-bold flex items-center gap-2">
                            <Users size={14} /> Total Invited
                        </span>
                        <span className="text-2xl font-bold">24</span>
                    </div>
                    <div className="flex flex-col gap-1 px-4">
                        <span className="text-default-500 text-xs uppercase font-bold flex items-center gap-2">
                            <TrendingUp size={14} /> Total Earnings
                        </span>
                        <span className="text-2xl font-bold text-green-500">$1,450.50</span>
                    </div>
                </div>

                {/* Link */}
                <div className="p-6 pt-0 bg-default-50 dark:bg-black/20 m-6 rounded-xl border border-dashed border-default-200">
                    <p className="text-xs font-bold text-default-500 mb-2 mt-4">YOUR REFERRAL LINK</p>
                    <Input 
                        readOnly 
                        value="https://mastersync.com/ref/ALEX2024" 
                        endContent={
                            <Button isIconOnly size="sm" variant="light">
                                <Copy size={16} />
                            </Button>
                        }
                    />
                </div>

             </CardBody>
        </Card>
    );
}
