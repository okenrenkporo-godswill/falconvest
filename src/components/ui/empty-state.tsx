import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon = "📭",
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-default-700 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-default-500 max-w-md mb-6">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}
