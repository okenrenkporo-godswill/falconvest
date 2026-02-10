import { ReactNode } from "react";

interface ActionButtonProps {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    variant?: "default" | "outline";
    className?: string;
}

export function ActionButton({
    icon,
    label,
    onClick,
    variant = "default",
    className = "",
}: ActionButtonProps) {
    return (
        <div className={`action-btn ${className}`} onClick={onClick}>
            <div
                className={
                    variant === "default"
                        ? "action-btn-circle"
                        : "w-14 h-14 rounded-full border-2 border-brand-500 text-brand-500 flex items-center justify-center transition-all duration-200 hover:bg-brand-50 dark:hover:bg-brand-950"
                }
            >
                {icon}
            </div>
            <span className="text-xs font-medium text-default-700">{label}</span>
        </div>
    );
}
