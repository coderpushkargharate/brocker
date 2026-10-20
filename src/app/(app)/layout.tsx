import { Header } from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[calc(100vh-88px)] bg-page pb-16">
        {children}
      </main>
    </>
  );
}
