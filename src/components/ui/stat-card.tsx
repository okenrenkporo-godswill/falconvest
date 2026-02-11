import { Card, CardBody, CardHeader } from "@heroui/react";
import { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    changePercent?: number;
    icon?: ReactNode;
    isLoading?: boolean;
    className?: string;
}

export function StatCard({
    label,
    value,
    change,
    changePercent,
    icon,
    isLoading = false,
    className = "",
}: StatCardProps) {
    const isPositive = change ? change > 0 : changePercent ? changePercent > 0 : null;

    return (
        <Card className={`card-hover ${className}`}>
            <CardHeader className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-default-600">{label}</h3>
                {icon && <div className="text-default-400">{icon}</div>}
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <div className="h-8 w-24 bg-default-200 rounded animate-pulse" />
                ) : (
                    <>
                        <p className="text-2xl font-bold">{value}</p>
                        {(change !== undefined || changePercent !== undefined) && (
                            <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive === true ? 'text-profit' : isPositive === false ? 'text-loss' : 'text-default-500'
                                }`}>
                                {isPositive !== null && (
                                    <span>{isPositive ? '↑' : '↓'}</span>
                                )}
                                {changePercent !== undefined && (
                                    <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
                                )}
                                {change !== undefined && (
                                    <span className="ml-1">
                                        {isPositive ? '+' : ''}${change.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
}
