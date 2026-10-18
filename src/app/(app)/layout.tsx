import { OneTimeNotice } from "@/components/one-time-notice";
import { Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Shell>{children}</Shell>
      <OneTimeNotice />
    </>
  );
}
