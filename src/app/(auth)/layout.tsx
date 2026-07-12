import { AdireBackground } from "@/components/ui/adire-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-bg-page flex flex-col">
      <AdireBackground />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}