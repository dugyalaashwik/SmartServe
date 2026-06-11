import Link from "next/link";

export const metadata = {
  title: "You're booked in! | Smart Serve",
};

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#06142b] px-6 text-center text-white">
      {/* Radial wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(95,195,232,0.15) 0%, rgba(6,20,43,0) 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Checkmark circle */}
        <div className="mb-8 flex size-20 items-center justify-center rounded-full border border-[#5fc3e8]/30 bg-[#5fc3e8]/10 shadow-[0_0_40px_rgba(95,195,232,0.25)]">
          <svg
            viewBox="0 0 24 24"
            className="size-10 text-[#5fc3e8]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          You&apos;re <span className="text-[#5fc3e8]">booked in!</span>
        </h1>

        {/* Subline */}
        <p className="mt-4 max-w-md text-base text-white/60">
          We&apos;ll call you within the hour. Check your email for confirmation.
        </p>

        {/* Divider */}
        <div className="my-8 h-px w-16 bg-white/10" />

        {/* Back link */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          ← Back to Smart Serve
        </Link>
      </div>
    </div>
  );
}
