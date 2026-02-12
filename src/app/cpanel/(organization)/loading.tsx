import { LogoLoader } from "@/components/ui/logo-loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full p-12">
      <LogoLoader />
    </div>
  );
}
