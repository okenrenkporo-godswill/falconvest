import { LogoLoader } from "@/components/ui/logo-loader";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background z-50">
            <LogoLoader />
        </div>
    );
}
