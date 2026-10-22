import { permanentRedirect } from "next/navigation";

// The Investors page is hidden; its content now lives on Buy Land.
export default function InvestorsPage() {
  permanentRedirect("/buy-land");
}
