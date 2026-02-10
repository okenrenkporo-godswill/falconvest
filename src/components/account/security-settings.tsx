"use client";

import { Card, CardBody, CardHeader, Input, Button, Switch, Divider } from "@heroui/react";
import { Lock, Smartphone, Shield } from "lucide-react";

export function SecuritySettings() {
    return (
        <Card className="border-none shadow-md dark:bg-zinc-900">
            <CardHeader className="flex gap-3 pb-0">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Shield size={20} />
                </div>
                <div className="flex flex-col">
                    <p className="text-md font-bold">Security Settings</p>
                    <p className="text-small text-default-500">Manage your password and 2FA</p>
                </div>
            </CardHeader>
            <CardBody className="gap-6 p-6">
                
                {/* 2FA Section */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <Smartphone className="text-default-400 mt-1" size={20} />
                        <div>
                            <p className="font-semibold text-sm">Two-Factor Authentication (2FA)</p>
                            <p className="text-xs text-default-500">Secure your account with Google Authenticator</p>
                        </div>
                    </div>
                    <Switch defaultSelected size="sm" color="success" />
                </div>

                <Divider />

                {/* Password Form */}
                <div className="space-y-4">
                    <p className="font-semibold text-sm flex items-center gap-2">
                        <Lock size={16} className="text-default-400" /> 
                        Update Password
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Current Password" 
                            type="password" 
                            variant="bordered" 
                            size="sm"
                        />
                        <div className="hidden md:block"></div> {/* Spacer */}
                        
                        <Input 
                            label="New Password" 
                            type="password" 
                            variant="bordered" 
                            size="sm"
                        />
                        <Input 
                            label="Confirm Password" 
                            type="password" 
                            variant="bordered" 
                            size="sm"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button color="primary" size="sm" className="font-medium">
                            Update Password
                        </Button>
                    </div>
                </div>

                <Divider />

                {/* Activity Log */}
                <div>
                    <p className="font-semibold text-sm mb-3">Recent Activity</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs p-2 hover:bg-default-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span>Windows PC (Chrome)</span>
                            </div>
                            <span className="text-default-400">Just now</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-2 hover:bg-default-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-default-300"></div>
                                <span>iPhone 14 Pro (App)</span>
                            </div>
                            <span className="text-default-400">2 hours ago</span>
                        </div>
                    </div>
                </div>

            </CardBody>
        </Card>
    );
}
