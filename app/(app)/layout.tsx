import { AppShell } from "../components/AppShell";
import { AppProvider } from "../lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
