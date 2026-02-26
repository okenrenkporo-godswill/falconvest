'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Chip
} from "@heroui/react";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { getActivePackages, type InvestmentPackage } from "@/actions/investment-packages";

export function PricingModal({ 
    isOpen, 
    onOpenChange,
    onSelectPackage 
}: { 
    isOpen: boolean; 
    onOpenChange: () => void;
    onSelectPackage?: (amount: number) => void;
}) {
    const [packages, setPackages] = useState<InvestmentPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadPackages();
        }
    }, [isOpen]);

    const loadPackages = async () => {
        setLoading(true);
        const data = await getActivePackages();
        setPackages(data);
        setLoading(false);
    };
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
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Card key={i} className="h-48">
                                            <CardBody className="animate-pulse bg-default-100" />
                                        </Card>
                                    ))}
                                </div>
                            ) : packages.length === 0 ? (
                                <div className="text-center py-8 text-default-500">
                                    No packages available at the moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {packages.map((pkg) => (
                                        <Card key={pkg.id} className={`border ${pkg.is_popular ? 'border-amber-500/50 dark:border-amber-500/30' : 'border-default-200'} shadow-sm`}>
                                            <CardBody className="gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className={`text-lg font-bold ${pkg.is_popular ? 'text-amber-500' : ''}`}>{pkg.name}</h3>
                                                        <p className="text-2xl font-bold mt-1">${pkg.amount.toLocaleString()}</p>
                                                    </div>
                                                    {pkg.is_popular && <Chip color="warning" variant="flat" size="sm">Popular</Chip>}
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
                                                    color={pkg.color as any}
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
                            )}
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
