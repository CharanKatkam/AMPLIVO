import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center font-inter">
      <p className="text-sm font-semibold tracking-wide text-[#4C1D95]">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#4C1D95] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3b1675]"
        >
          Return Home
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-[#4C1D95] hover:text-[#4C1D95]"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
