export function SkeletonCard() {
    return (
        <div className="border border-default-200 rounded-lg p-4 animate-pulse">
            <div className="h-4 w-1/3 bg-default-200 rounded mb-3" />
            <div className="h-8 w-1/2 bg-default-300 rounded mb-2" />
            <div className="h-3 w-1/4 bg-default-200 rounded" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                    <div className="h-10 w-10 bg-default-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/4 bg-default-200 rounded" />
                        <div className="h-3 w-1/3 bg-default-100 rounded" />
                    </div>
                    <div className="h-4 w-1/5 bg-default-200 rounded" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-default-200 rounded" />
                        <div className="h-3 w-24 bg-default-100 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-default-200 rounded" />
                </div>
            ))}
        </div>
    );
}
