'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Card,
    CardBody,
    Chip
} from "@heroui/react";
import { Check } from "lucide-react";

const PACKAGES = [
    {
        name: "Bronze",
        price: "$1000",
        amount: 1000,
        features: ["Basic Trading Access", "Standard Support", "5% Mining Power"],
        color: "default" as const
    },
    {
        name: "Silver",
        price: "$10,000",
        amount: 10000,
        features: ["Advanced Trading Tools", "Priority Support", "10% Mining Power", "Low Fees"],
        color: "warning" as const,
        popular: false
    },
    {
        name: "Gold",
        price: "$50,000",
        amount: 50000,
        features: ["Zero Trading Fees", "24/7 VIP Support", "25% Mining Power", "Copy Trading Pro"],
        color: "secondary" as const,
        popular: true
    },
    {
        name: "Premium",
        price: "$500,000+",
        amount: 500000,
        features: ["Institutional Tools", "Dedicated Account Manager", "50% Mining Power", "Private Signals"],
        color: "primary" as const
    }
];

export function PricingModal({ 
    isOpen, 
    onOpenChange,
    onSelectPackage 
}: { 
    isOpen: boolean; 
    onOpenChange: () => void;
    onSelectPackage?: (amount: number) => void;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
            backdrop="blur"
            placement="center"
        >
            <ModalContent className="max-h-[85vh]">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Investment Packages</h2>
                            <p className="text-sm text-default-500 font-normal">Choose a plan that suits your investment goals.</p>
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PACKAGES.map((pkg) => (
                                    <Card key={pkg.name} className={`border ${pkg.popular ? 'border-amber-500/50 dark:border-amber-500/30' : 'border-default-200'} shadow-sm`}>
                                        <CardBody className="gap-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`text-lg font-bold ${pkg.popular ? 'text-amber-500' : ''}`}>{pkg.name}</h3>
                                                    <p className="text-2xl font-bold mt-1">{pkg.price}</p>
                                                </div>
                                                {pkg.popular && <Chip color="warning" variant="flat" size="sm">Popular</Chip>}
                                            </div>

                                            <div className="space-y-2 mt-2">
                                                {pkg.features.map((feat) => (
                                                    <div key={feat} className="flex items-center gap-2 text-sm text-default-600">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                color={pkg.color}
                                                variant="flat"
                                                className="w-full mt-3"
                                                onPress={() => {
                                                    onSelectPackage?.(pkg.amount);
                                                    onClose();
                                                }}
                                            >
                                                Select {pkg.name}
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
