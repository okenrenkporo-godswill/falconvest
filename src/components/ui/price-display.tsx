interface PriceDisplayProps {
    price: number;
    change?: number;
    changePercent?: number;
    showChange?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function PriceDisplay({
    price,
    change,
    changePercent,
    showChange = true,
    size = "md",
    className = "",
}: PriceDisplayProps) {
    const isPositive = change ? change > 0 : changePercent ? changePercent > 0 : null;

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl",
    };

    const changeSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className={`font-semibold ${sizeClasses[size]}`}>
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {showChange && changePercent !== undefined && (
                <span
                    className={`${changeSizeClasses[size]} font-medium ${isPositive === true
                            ? "text-profit"
                            : isPositive === false
                                ? "text-loss"
                                : "text-default-500"
                        }`}
                >
                    {isPositive !== null && (isPositive ? "↑" : "↓")}
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                </span>
            )}
        </div>
    );
}
