"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { HeroNav } from "@/components/marketing/HeroNav";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  businessName: z.string().min(1, "Business name is required"),
  industry: z.enum(["Restaurant", "Dental", "Salon", "Other"], {
    error: () => ({ message: "Please select an industry" }),
  }),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  bestTime: z.enum(["Morning", "Afternoon", "Evening", ""]).optional(),
  notes: z.string().optional(),
  source: z.enum([
    "",
    "Google Search",
    "Social Media",
    "Word of Mouth",
    "Online Ad",
    "Blog / Article",
    "Email",
    "Other",
  ]).optional(),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------
const inputCls =
  "w-full rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm outline-none transition-colors focus:border-[#5fc3e8] focus:bg-white/[0.09]";

const labelCls = "block mb-1.5 text-xs font-medium uppercase tracking-wide text-white/50";

const errorCls = "mt-1 text-xs text-[#e8533f]";

// ---------------------------------------------------------------------------
// Inner form — uses useSearchParams, must be inside <Suspense>
// ---------------------------------------------------------------------------
function DemoForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams.get("source") ?? "";

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: source as FormValues["source"] },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitError(null);
    try {
      const res = await fetch(
        "https://n8n.recruitpro.it.com/webhook/smart-serve/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      // Parse JSON only if the response has a body — n8n sometimes returns 200 with no content
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          // If n8n explicitly signals failure, surface that
          if (json?.ok === false) {
            throw new Error(json?.message ?? "Submission failed. Please try again.");
          }
        } catch {
          // Non-JSON or ok:false already thrown above — treat non-JSON 200 as success
        }
      }

      // Any 2xx response (with or without body) is treated as success
      router.push("/demo/thank-you");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur"
    >
      {/* Hidden utm/source passthrough — overridden by visible dropdown below */}

      {/* Full Name */}
      <div className="mb-5">
        <label htmlFor="fullName" className={labelCls}>
          Full name <span className="text-[#e8533f]">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="Jane Smith"
          className={inputCls}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className={errorCls}>{errors.fullName.message}</p>
        )}
      </div>

      {/* Business Name */}
      <div className="mb-5">
        <label htmlFor="businessName" className={labelCls}>
          Business name <span className="text-[#e8533f]">*</span>
        </label>
        <input
          id="businessName"
          type="text"
          placeholder="Bliss Hair Studio"
          className={inputCls}
          {...register("businessName")}
        />
        {errors.businessName && (
          <p className={errorCls}>{errors.businessName.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="mb-5">
        <label htmlFor="industry" className={labelCls}>
          Industry <span className="text-[#e8533f]">*</span>
        </label>
        <select
          id="industry"
          className={`${inputCls} appearance-none`}
          defaultValue=""
          {...register("industry")}
        >
          <option value="" disabled className="bg-[#06142b] text-white/40">
            Select your industry
          </option>
          <option value="Restaurant" className="bg-[#06142b]">
            Restaurant
          </option>
          <option value="Dental" className="bg-[#06142b]">
            Dental
          </option>
          <option value="Salon" className="bg-[#06142b]">
            Salon
          </option>
          <option value="Other" className="bg-[#06142b]">
            Other
          </option>
        </select>
        {errors.industry && (
          <p className={errorCls}>{errors.industry.message}</p>
        )}
      </div>

      {/* Phone + Email — side by side on md+ */}
      <div className="mb-5 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone <span className="text-[#e8533f]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            className={inputCls}
            {...register("phone")}
          />
          {errors.phone && (
            <p className={errorCls}>{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email <span className="text-[#e8533f]">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="jane@example.com"
            className={inputCls}
            {...register("email")}
          />
          {errors.email && (
            <p className={errorCls}>{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Best time */}
      <div className="mb-5">
        <label htmlFor="bestTime" className={labelCls}>
          Best time to call{" "}
          <span className="text-white/30 normal-case">(optional)</span>
        </label>
        <select
          id="bestTime"
          className={`${inputCls} appearance-none`}
          defaultValue=""
          {...register("bestTime")}
        >
          <option value="" className="bg-[#06142b] text-white/40">
            No preference
          </option>
          <option value="Morning" className="bg-[#06142b]">
            Morning
          </option>
          <option value="Afternoon" className="bg-[#06142b]">
            Afternoon
          </option>
          <option value="Evening" className="bg-[#06142b]">
            Evening
          </option>
        </select>
      </div>

      {/* How did you hear about us */}
      <div className="mb-5">
        <label htmlFor="source" className={labelCls}>
          How did you hear about us?{" "}
          <span className="text-white/30 normal-case">(optional)</span>
        </label>
        <select
          id="source"
          className={`${inputCls} appearance-none`}
          defaultValue=""
          {...register("source")}
        >
          <option value="" className="bg-[#06142b] text-white/40">
            Select an option
          </option>
          <option value="Google Search" className="bg-[#06142b]">Google Search</option>
          <option value="Social Media" className="bg-[#06142b]">Social Media</option>
          <option value="Word of Mouth" className="bg-[#06142b]">Word of Mouth</option>
          <option value="Online Ad" className="bg-[#06142b]">Online Ad</option>
          <option value="Blog / Article" className="bg-[#06142b]">Blog / Article</option>
          <option value="Email" className="bg-[#06142b]">Email</option>
          <option value="Other" className="bg-[#06142b]">Other</option>
        </select>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label htmlFor="notes" className={labelCls}>
          Anything else?{" "}
          <span className="text-white/30 normal-case">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Tell us about your setup, call volume, or any specific questions…"
          className={`${inputCls} resize-none`}
          {...register("notes")}
        />
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="mb-4 rounded-xl border border-[#e8533f]/30 bg-[#e8533f]/10 px-4 py-3 text-sm text-[#e8533f]">
          {submitError}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#e8533f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(232,83,63,0.7)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_36px_-8px_rgba(232,83,63,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Booking your demo…" : "Book my free demo →"}
      </button>

      <p className="mt-4 text-center text-xs text-white/30">
        No spam. No credit card. We call you.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#06142b] text-white">
      <HeroNav />

      {/* Subtle radial gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(59,139,217,0.15) 0%, rgba(6,20,43,0) 60%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-xl px-6 pb-24 pt-32">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#5fc3e8] backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#e8533f] shadow-[0_0_12px_#e8533f]" />
            15-min demo
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            Book your <span className="text-[#5fc3e8]">live demo</span>
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Tell us a little about your business and we&apos;ll call you within the hour.
          </p>
        </div>

        {/* Form wrapped in Suspense — required for useSearchParams() in Next.js 14+ */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/40 backdrop-blur">
              Loading…
            </div>
          }
        >
          <DemoForm />
        </Suspense>
      </main>
    </div>
  );
}
