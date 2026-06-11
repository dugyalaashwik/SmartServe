import { HeroTextTop, HeroTextBottom } from "@/components/marketing/HeroText";
import { HeroNav } from "@/components/marketing/HeroNav";
import { LandingScene, LandingVerticals } from "@/components/marketing/LandingClient";
import { RestaurantIconBare } from "@/components/three/verticals/RestaurantIcon";
import { SalonIconBare } from "@/components/three/verticals/SalonIcon";
import { DentalIconBare } from "@/components/three/verticals/DentalIcon";

export default function LandingPage() {
  return (
    <>
      <HeroNav />

      {/* HERO — fullscreen, 3D canvas behind text */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Radial gradient wash behind the canvas to ground the scene */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(59,139,217,0.18) 0%, rgba(6,20,43,0) 60%)",
          }}
        />

        {/* 3D layer — fills the middle band, headline/CTAs sit above and below */}
        <div className="absolute inset-0 z-0">
          <LandingScene />
        </div>

        {/* TOP zone: badge + headline, anchored just below the nav */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-24 md:pt-28">
          <HeroTextTop />
        </div>

        {/* BOTTOM zone: subtitle + CTAs, sitting above the scroll cue */}
        <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center">
          <HeroTextBottom />
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/40">
            <span>Scroll</span>
            <span className="block h-8 w-px animate-pulse bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Below-the-fold — GLB bounces around the section background */}
      <LandingVerticals items={VERTICALS} />

      <section id="how" className="mx-auto max-w-6xl px-6 pb-40 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#5fc3e8]">
          How it works
        </p>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Plug a phone number in. Walk away.
        </h2>
      </section>
    </>
  );
}

const VERTICALS = [
  {
    emoji: "🍽️",
    title: "Restaurants",
    body: "Your restaurant, always open. AI answers every call, takes table orders via QR, and fires everything straight to the kitchen — 24/7, zero missed orders.",
    tags: ["QR ordering", "AI phone agent", "Live kitchen", "Analytics"],
    glow: "radial-gradient(circle at 30% 30%, #e8533f, transparent 60%)",
    accent: "#e8533f",
    Model: RestaurantIconBare,
    modelScale: 2.0,
    points: [
      { icon: "🔲", text: "Scan QR → order direct to kitchen, no app needed" },
      { icon: "🤖", text: "AI answers every call & takes phone orders 24/7" },
      { icon: "🖥️", text: "Live kitchen dashboard — both channels, one view" },
      { icon: "📈", text: "Charts & insights to grow your business" },
      { icon: "💡", text: "Smart upsells on every order, every time" },
      { icon: "👤", text: "Recognises returning customers by number" },
      { icon: "📅", text: "Never miss a reservation or walk-in again" },
      { icon: "📱", text: "Works from your existing phone number" },
    ],
  },
  {
    emoji: "✂️",
    title: "Salons & Spas",
    body: "Your AI receptionist that knows your clients — books the right stylist, remembers every preference, and fills your chair even when you're busy with another customer.",
    tags: ["Stylist booking", "Client memory", "Upsells", "Cancellation refill"],
    glow: "radial-gradient(circle at 70% 30%, #5fc3e8, transparent 60%)",
    accent: "#5fc3e8",
    Model: SalonIconBare,
    modelScale: 2.2,
    points: [
      { icon: "✂️", text: "Books by stylist, service & availability in one call" },
      { icon: "🧠", text: "Remembers client preferences & past services" },
      { icon: "✨", text: "Upsells add-ons like glosses and treatments — naturally" },
      { icon: "🔄", text: "Instantly refills cancelled slots with waiting clients" },
      { icon: "📅", text: "Handles reschedules & cancellations without you lifting a finger" },
      { icon: "📱", text: "Works from your existing salon phone number" },
      { icon: "🚫", text: "Never loses a client to a missed call again" },
    ],
  },
  {
    emoji: "🦷",
    title: "Dental Clinics",
    body: "Your AI front desk that never takes a day off — books appointments, screens new patients, checks insurance, and triggers six-month recalls automatically.",
    tags: ["Smart scheduling", "New patient intake", "Insurance check", "6-month recalls"],
    glow: "radial-gradient(circle at 50% 70%, #3b8bd9, transparent 60%)",
    accent: "#3b8bd9",
    Model: DentalIconBare,
    points: [
      { icon: "📅", text: "Books by procedure, provider & availability instantly" },
      { icon: "📋", text: "Screens new patients before they even walk in" },
      { icon: "🏥", text: "Checks insurance eligibility on the call" },
      { icon: "⏰", text: "Auto-triggers six-month recall reminders" },
      { icon: "🔄", text: "Handles reschedules & cancellations with confirmation codes" },
      { icon: "🔀", text: "Routes complex insurance questions to your front desk" },
      { icon: "🖥️", text: "Live appointments dashboard for your whole team" },
      { icon: "📱", text: "Works from your existing practice phone number" },
    ],
  },
];
