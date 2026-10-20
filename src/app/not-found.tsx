import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-[64px] font-bold text-brand">404</p>
        <h1 className="text-[28px] font-bold text-ink">This page could not be found</h1>
        <p className="mt-2 max-w-md text-[15px] text-body">The land may have been sold or removed. Explore other verified agricultural lands instead.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/buy-land" className="btn btn-primary h-11 px-6">
            Explore Land
          </Link>
          <Link href="/" className="btn btn-ghost h-11 px-6">
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
