import Link from "next/link";
export default function NotFound() {
  return (
    <main className="placeholder-page">
      <h1>Page not found.</h1>
      <p>This page is not part of the Phase 1 dashboard.</p>
      <Link href="/">Return to market overview →</Link>
    </main>
  );
}
