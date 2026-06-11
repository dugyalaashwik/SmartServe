"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Vapi from "@vapi-ai/web";
import { HeroNav } from "@/components/marketing/HeroNav";



// ---------------------------------------------------------------------------
// Vapi credentials
// ---------------------------------------------------------------------------
const VAPI_PUBLIC_KEY         = "21d2dfd1-01dd-4406-82d2-9d3d36e3f674";
const RESTAURANT_ASSISTANT_ID = "c258cc28-ee29-4250-a31f-5e7ba1ef3f2e";
const DENTAL_ASSISTANT_ID     = "ad210338-4d67-4a2f-842f-b2d8e26e0dfe";
const SALON_ASSISTANT_ID      = "3ba41b8b-6037-434c-8a93-507128f68d05";

// ---------------------------------------------------------------------------
// Types — Restaurant
// ---------------------------------------------------------------------------
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
  spiceLevel?: string;
  modifications?: string[];
}

interface OrderData {
  customerName: string;
  items: OrderItem[];
}

type OrderAction = "add" | "remove" | "modify" | "clear";

// ---------------------------------------------------------------------------
// Types — Dental
// ---------------------------------------------------------------------------
interface DentalAppointment {
  service: string;
  selectedSlots: string[];  // slot_ids offered by Mia (union across select calls)
  confirmedSlot?: string;   // single slot_id confirmed by the user
}

interface DentalData {
  customerName: string;
  appointment: DentalAppointment | null;
  isEmergency: boolean;
  emergencyReason?: string;
}

// ---------------------------------------------------------------------------
// Types — Salon
// ---------------------------------------------------------------------------
interface SalonAppointment {
  services: string[];   // one or more services booked
  selectedSlots: string[];
  confirmedSlot?: string;
}

interface SalonData {
  customerName: string;
  appointment: SalonAppointment | null;
}

// ---------------------------------------------------------------------------
// Order state reducer — handles add / remove / modify / clear
// ---------------------------------------------------------------------------
function applyOrderAction(
  prev: OrderData,
  action: OrderAction,
  item: string,
  price: number,
  quantity: number,
  isFree?: boolean,
  spiceLevel?: string,
  modifications?: string[],
): OrderData {
  const newEntry: OrderItem = { name: item, price, quantity, isFree, spiceLevel, modifications };

  switch (action) {
    case "clear":
      return { ...prev, items: [] };

    case "add": {
      // If same item + spice level already in cart, increase quantity
      const idx = prev.items.findIndex(
        (i) => i.name === item && i.spiceLevel === spiceLevel,
      );
      if (idx >= 0) {
        const updated = [...prev.items];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return { ...prev, items: updated };
      }
      return { ...prev, items: [...prev.items, newEntry] };
    }

    case "remove": {
      const idx = prev.items.findIndex(
        (i) => i.name === item && i.spiceLevel === spiceLevel,
      );
      if (idx < 0) return prev;
      const updated = [...prev.items];
      if (updated[idx].quantity > quantity) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - quantity };
      } else {
        updated.splice(idx, 1);
      }
      return { ...prev, items: updated };
    }

    case "modify": {
      const idx = prev.items.findIndex((i) => i.name === item);
      if (idx >= 0) {
        const updated = [...prev.items];
        updated[idx] = newEntry;
        return { ...prev, items: updated };
      }
      return { ...prev, items: [...prev.items, newEntry] };
    }

    default:
      return prev;
  }
}

// ---------------------------------------------------------------------------
// Industry config
// ---------------------------------------------------------------------------
const INDUSTRIES = [
  {
    id: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    accent: "#e8533f",
    glow: "rgba(232,83,63,0.25)",
    tag: "Taking a table booking",
    vapiEnabled: true,
  },
  {
    id: "dental",
    label: "Dental",
    emoji: "🦷",
    accent: "#3b8bd9",
    glow: "rgba(59,139,217,0.25)",
    tag: "Booking a cleaning or whitening",
    vapiEnabled: true,
  },
  {
    id: "salon",
    label: "Salon",
    emoji: "✂️",
    accent: "#5fc3e8",
    glow: "rgba(95,195,232,0.25)",
    tag: "Stylist appointment",
    vapiEnabled: true,
  },
];

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------
const MENU_ITEMS = [
  {
    id: "biryani",
    name: "Biryani",
    emoji: "🍛",
    desc: "Fragrant basmati rice with spiced meat",
    options: ["Chicken", "Lamb", "Vegetable"],
  },
  {
    id: "shawarma",
    name: "Shawarma",
    emoji: "🌯",
    desc: "Slow-roasted meat wrap with garlic sauce",
    options: ["Chicken", "Beef", "Mixed"],
  },
  {
    id: "coke",
    name: "Coke",
    emoji: "🥤",
    desc: "Ice-cold Coca-Cola",
    options: ["Regular", "Diet", "Zero Sugar"],
  },
];

// ---------------------------------------------------------------------------
// Retro phone
// ---------------------------------------------------------------------------
function RetroPhone({ ringing }: { ringing: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ animation: ringing ? "phone-ring 0.5s ease-in-out infinite" : undefined }}
    >
      {ringing && (
        <>
          <span className="absolute size-36 rounded-full border border-[#5fc3e8]/30 animate-ping" style={{ animationDuration: "1.2s" }} />
          <span className="absolute size-52 rounded-full border border-[#5fc3e8]/15 animate-ping" style={{ animationDuration: "1.6s", animationDelay: "0.3s" }} />
        </>
      )}
      <div
        className="relative flex size-28 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] backdrop-blur transition-shadow"
        style={ringing ? { boxShadow: "0 0 80px rgba(95,195,232,0.3)" } : { boxShadow: "0 0 60px rgba(95,195,232,0.15)" }}
      >
        <svg viewBox="0 0 64 64" className="size-14 text-[#5fc3e8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 10 C14 8 16 6 20 8 L26 14 C28 16 27 19 25 20 L22 22 C21 23 21 24 22 25 L39 42 C40 43 41 43 42 42 L44 39 C45 37 48 36 50 38 L56 44 C58 48 56 50 54 50 C38 52 12 26 14 10 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M16 48 Q20 44 22 46 Q24 48 26 44 Q28 40 30 42" strokeDasharray="3 2" opacity="0.5" />
          {ringing && (
            <>
              <line x1="50" y1="10" x2="50" y2="14" strokeWidth="2.5" opacity="0.7" />
              <line x1="48" y1="12" x2="52" y2="12" strokeWidth="2.5" opacity="0.7" />
              <line x1="56" y1="6" x2="56" y2="9" strokeWidth="2" opacity="0.5" />
              <line x1="54.5" y1="7.5" x2="57.5" y2="7.5" strokeWidth="2" opacity="0.5" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Waveform
// ---------------------------------------------------------------------------
function Waveform({ accent }: { accent: string }) {
  return (
    <div className="flex items-end gap-0.5 h-6 mr-3">
      {[3, 6, 4, 8, 5, 7, 3, 6, 4].map((h, i) => (
        <span key={i} className="w-1 rounded-full"
          style={{ height: `${h * 3}px`, background: accent, opacity: 0.7, animation: `wave-bar 0.8s ease-in-out ${i * 0.08}s infinite alternate` }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mic button
// ---------------------------------------------------------------------------
function MicButton({ active, loading, accent, disabled, onClick }: {
  active: boolean; loading: boolean; accent: string; disabled: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled && !active}
      className="group relative flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
      style={active ? { background: `${accent}22`, borderColor: `${accent}66`, boxShadow: `0 0 24px ${accent}55` } : undefined}
      aria-label={active ? "End call" : "Start call"}
    >
      {active && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: `${accent}22` }} />}
      {loading ? (
        <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: accent }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : active ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" style={{ color: accent }}>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5 text-white/60 transition-colors group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Menu panel
// ---------------------------------------------------------------------------
function MenuPanel({ visible }: { visible: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="overflow-hidden transition-all duration-500"
      style={{ maxHeight: visible ? "600px" : "0px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)" }}
    >
      <div className="mt-3 rounded-2xl border border-[#e8533f]/25 bg-[#e8533f]/[0.06] p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">🍽️</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#e8533f]">Today&apos;s Menu</p>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#e8533f]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#e8533f]">
            <span className="size-1.5 rounded-full bg-[#e8533f] animate-pulse" />Live
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {MENU_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                <button type="button" onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-white/30 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "120px" : "0px" }}>
                  <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3">
                    <p className="w-full mb-1 text-[10px] uppercase tracking-widest text-white/30">Choose variant</p>
                    {item.options.map((opt) => (
                      <button key={opt} type="button"
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70 transition-all hover:border-[#e8533f]/50 hover:bg-[#e8533f]/10 hover:text-[#e8533f]"
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order receipt panel
// ---------------------------------------------------------------------------
function OrderPanel({ order, visible, callEnded, onClear }: {
  order: OrderData | null;
  visible: boolean;
  callEnded: boolean;
  onClear: () => void;
}) {
  const total = order?.items.reduce((sum, i) => sum + (i.isFree ? 0 : i.price * i.quantity), 0) ?? 0;

  return (
    <div
      className="w-full transition-all duration-500 overflow-hidden"
      style={{
        maxWidth: visible ? "480px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="min-w-[300px] rounded-2xl border border-[#e8533f]/30 bg-white/[0.04] backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="bg-[#e8533f]/10 px-6 py-5 border-b border-[#e8533f]/20">
          <div className="flex items-center gap-2 mb-1">
            {callEnded ? (
              <>
                <svg viewBox="0 0 24 24" className="size-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Order Confirmed</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-[#e8533f] animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#e8533f]">Live Order</span>
              </>
            )}
          </div>
          <h2 className="font-display text-xl font-semibold text-white">Smart Serve Order</h2>
          {order?.customerName ? (
            <p className="mt-1 text-sm text-white/60">
              Customer: <span className="text-white font-medium">{order.customerName}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/30 italic">Waiting for customer details…</p>
          )}
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          {order && order.items.length > 0 ? (
            <>
              {/* Column headers */}
              <div className="mb-2 grid grid-cols-4 gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/30 border-b border-white/[0.07] pb-2">
                <span className="col-span-2">Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Subtotal</span>
              </div>

              {/* Rows */}
              <div className="flex flex-col divide-y divide-white/[0.05]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 py-3 text-sm items-start">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white">{item.name}</p>
                        {item.isFree && (
                          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                            FREE
                          </span>
                        )}
                      </div>
                      {item.spiceLevel && (
                        <p className="text-xs text-[#e8533f]/70 capitalize mt-0.5">
                          🌶 {item.spiceLevel}
                        </p>
                      )}
                      {item.modifications && item.modifications.length > 0 && (
                        <p className="text-xs text-white/30 mt-0.5">
                          {item.modifications.join(", ")}
                        </p>
                      )}
                      {!item.isFree && (
                        <p className="text-xs text-white/35 mt-0.5">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                    <p className="text-center text-white/70">{item.quantity}</p>
                    <p className="text-right font-semibold text-white">
                      {item.isFree
                        ? <span className="text-green-400 text-xs font-semibold">Free</span>
                        : `$${(item.price * item.quantity).toFixed(2)}`}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#e8533f]/10 border border-[#e8533f]/20 px-4 py-3">
                <span className="text-sm font-semibold text-white/70">Total</span>
                <span className="text-lg font-bold text-[#e8533f]">${total.toFixed(2)}</span>
              </div>

              {/* New order button — shown after call ends */}
              {callEnded && (
                <button
                  type="button"
                  onClick={onClear}
                  className="mt-4 w-full rounded-full border border-white/10 bg-white/[0.05] py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
                >
                  Start new order
                </button>
              )}
            </>
          ) : (
            /* Empty state — waiting for order */
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex gap-1 items-end h-6">
                {[4, 7, 5, 9, 6].map((h, i) => (
                  <span key={i} className="w-1.5 rounded-full bg-[#e8533f]/50"
                    style={{ height: `${h * 3}px`, animation: `wave-bar 0.9s ease-in-out ${i * 0.1}s infinite alternate` }}
                  />
                ))}
              </div>
              <p className="text-sm text-white/30">Listening for order details…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dental services panel (mirrors MenuPanel — shown when dental call is active)
// ---------------------------------------------------------------------------
const DENTAL_SERVICES = [
  {
    id: "cleaning",
    name: "Routine Cleaning & Checkup",
    emoji: "🦷",
    desc: "Scaling, polishing & full oral exam",
    details: ["Professional scaling", "Teeth polishing", "Full oral health check", "X-ray if required"],
  },
  {
    id: "whitening",
    name: "Teeth Whitening",
    emoji: "✨",
    desc: "In-chair professional whitening treatment",
    details: ["Up to 8 shades lighter", "~60 min session", "Safe for enamel", "Immediate results"],
  },
  {
    id: "emergency",
    name: "Dental Emergency",
    emoji: "🚨",
    desc: "Severe pain, trauma, or urgent issues",
    details: ["Toothache / abscess", "Broken or knocked-out tooth", "Soft tissue injury", "Forwarded to our emergency line"],
  },
];

function DentalServicesPanel({ visible }: { visible: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="overflow-hidden transition-all duration-500"
      style={{ maxHeight: visible ? "600px" : "0px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)" }}
    >
      <div className="mt-3 rounded-2xl border border-[#3b8bd9]/25 bg-[#3b8bd9]/[0.06] p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">🦷</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3b8bd9]">Our Services</p>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#3b8bd9]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#3b8bd9]">
            <span className="size-1.5 rounded-full bg-[#3b8bd9] animate-pulse" />Live
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {DENTAL_SERVICES.map((svc) => {
            const isOpen = openId === svc.id;
            return (
              <div key={svc.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                <button type="button" onClick={() => setOpenId(isOpen ? null : svc.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="text-xl">{svc.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{svc.name}</p>
                    <p className="text-xs text-white/40">{svc.desc}</p>
                  </div>
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-white/30 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "160px" : "0px" }}>
                  <div className="flex flex-col gap-1.5 border-t border-white/[0.06] px-4 py-3">
                    {svc.details.map((d) => (
                      <div key={d} className="flex items-center gap-2">
                        <span className="size-1 shrink-0 rounded-full bg-[#3b8bd9]/60" />
                        <p className="text-xs text-white/60">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dental panel
// ---------------------------------------------------------------------------
function DentalPanel({ dental, visible, callEnded, onClear }: {
  dental: DentalData | null;
  visible: boolean;
  callEnded: boolean;
  onClear: () => void;
}) {
  const accent = "#3b8bd9";

  return (
    <div
      className="w-full transition-all duration-500 overflow-hidden"
      style={{
        maxWidth: visible ? "480px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="min-w-[300px] rounded-2xl border border-[#3b8bd9]/30 bg-white/[0.04] backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="bg-[#3b8bd9]/10 px-6 py-5 border-b border-[#3b8bd9]/20">
          <div className="flex items-center gap-2 mb-1">
            {dental?.isEmergency ? (
              <>
                <svg viewBox="0 0 24 24" className="size-3 text-[#e8533f]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#e8533f]">Forwarded to Emergency</span>
              </>
            ) : dental?.appointment?.confirmedSlot ? (
              <>
                <svg viewBox="0 0 24 24" className="size-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Appointment Booked</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-[#3b8bd9] animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3b8bd9]">Live Call</span>
              </>
            )}
          </div>
          <h2 className="font-display text-xl font-semibold text-white">Smart Serve Dental</h2>
          {dental?.customerName ? (
            <p className="mt-1 text-sm text-white/60">
              Patient: <span className="text-white font-medium">{dental.customerName}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/30 italic">Waiting for patient details…</p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {dental?.isEmergency ? (
            /* ── Emergency ─────────────────────────────────────────────────── */
            <div className="rounded-xl border border-[#e8533f]/30 bg-[#e8533f]/10 px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚨</span>
                <p className="text-sm font-semibold text-[#e8533f]">Dental Emergency</p>
              </div>
              <p className="text-xs text-white/50">
                {dental.emergencyReason ?? "Mia is forwarding this call to our emergency line."}
              </p>
            </div>

          ) : dental?.appointment?.confirmedSlot ? (() => {
            /* ── action = confirm — single slot in green ─────────────────────── */
            const parsed = parseSlotId(dental.appointment.confirmedSlot);
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/[0.06] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🦷</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{dental.appointment.service}</p>
                      <p className="text-xs text-white/40">Service</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-medium text-green-400">
                    Booked
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Date</p>
                    <p className="text-sm font-medium text-white">{parsed?.date ?? dental.appointment.confirmedSlot}</p>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Time</p>
                    <p className="text-sm font-semibold text-green-400">{parsed?.time ?? "—"}</p>
                  </div>
                </div>
              </div>
            );
          })() : dental?.appointment?.selectedSlots?.length ? (
            /* ── action = select — show offered slots as cards ───────────────── */
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <span className="text-xl">🦷</span>
                <div>
                  <p className="text-sm font-semibold text-white">{dental.appointment.service}</p>
                  <p className="text-xs text-white/40">Service</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5">Available Slots</p>
                <div className="grid grid-cols-2 gap-2">
                  {dental.appointment.selectedSlots.map((slotId) => {
                    const p = parseSlotId(slotId);
                    return (
                      <div key={slotId} className="rounded-xl border px-3 py-2.5 text-center"
                        style={{ borderColor: `${accent}55`, background: `${accent}10` }}>
                        <p className="text-xs font-semibold" style={{ color: accent }}>{p?.time ?? slotId}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{p?.date ?? ""}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-white/30 text-center mt-3">Waiting for confirmation…</p>
              </div>
            </div>

          ) : (
            /* ── No tool fired yet ───────────────────────────────────────────── */
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <span className="text-xl">🦷</span>
                <div>
                  <p className="text-sm text-white/20">—</p>
                  <p className="text-xs text-white/40">Service</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Date</p>
                  <p className="text-sm text-white/20">—</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Time</p>
                  <p className="text-sm text-white/20">—</p>
                </div>
              </div>
            </div>
          )}

          {callEnded && (
            <button type="button" onClick={onClear}
              className="mt-4 w-full rounded-full border border-white/10 bg-white/[0.05] py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
            >
              Start new call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Salon services panel
// ---------------------------------------------------------------------------
const SALON_SERVICES = [
  {
    id: "womens-haircut",
    name: "Women's Haircut",
    emoji: "✂️",
    desc: "Cut, blowdry & finish for all hair types",
    details: ["Style consultation", "Shampoo & condition", "Precision cut", "Blowdry & finish"],
  },
  {
    id: "mens-haircut",
    name: "Men's Haircut",
    emoji: "💈",
    desc: "Classic or modern cut tailored to you",
    details: ["Style consultation", "Scissor or clipper cut", "Clean neckline finish", "~30 min session"],
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    emoji: "🪒",
    desc: "Shape, line-up & tidy your beard",
    details: ["Beard shape & outline", "Hot towel treatment", "Moisturiser finish", "~20 min session"],
  },
  {
    id: "full-color",
    name: "Full Hair Color",
    emoji: "🎨",
    desc: "Full color, highlights or balayage",
    details: ["Color consultation", "Full color application", "Toner & treatment", "Blowdry included"],
  },
];

function SalonServicesPanel({ visible }: { visible: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const accent = "#5fc3e8";
  return (
    <div className="overflow-hidden transition-all duration-500"
      style={{ maxHeight: visible ? "700px" : "0px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)" }}
    >
      <div className="mt-3 rounded-2xl border p-5 backdrop-blur"
        style={{ borderColor: `${accent}40`, background: `${accent}0a` }}>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">✂️</span>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Our Services</p>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            style={{ background: `${accent}18`, color: accent }}>
            <span className="size-1.5 rounded-full animate-pulse" style={{ background: accent }} />Live
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {SALON_SERVICES.map((svc) => {
            const isOpen = openId === svc.id;
            return (
              <div key={svc.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                <button type="button" onClick={() => setOpenId(isOpen ? null : svc.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]">
                  <span className="text-xl">{svc.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{svc.name}</p>
                    <p className="text-xs text-white/40">{svc.desc}</p>
                  </div>
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-white/30 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "160px" : "0px" }}>
                  <div className="flex flex-col gap-1.5 border-t border-white/[0.06] px-4 py-3">
                    {svc.details.map((d) => (
                      <div key={d} className="flex items-center gap-2">
                        <span className="size-1 shrink-0 rounded-full" style={{ background: `${accent}99` }} />
                        <p className="text-xs text-white/60">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Salon appointment panel
// ---------------------------------------------------------------------------
function SalonPanel({ salon, visible, callEnded, onClear }: {
  salon: SalonData | null;
  visible: boolean;
  callEnded: boolean;
  onClear: () => void;
}) {
  const accent = "#5fc3e8";

  return (
    <div className="w-full transition-all duration-500 overflow-hidden"
      style={{
        maxWidth: visible ? "480px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="min-w-[300px] rounded-2xl bg-white/[0.04] backdrop-blur overflow-hidden border"
        style={{ borderColor: `${accent}4d` }}>
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ background: `${accent}1a`, borderColor: `${accent}33` }}>
          <div className="flex items-center gap-2 mb-1">
            {salon?.appointment?.confirmedSlot ? (
              <>
                <svg viewBox="0 0 24 24" className="size-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">Appointment Booked</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full animate-pulse" style={{ background: accent }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>Live Call</span>
              </>
            )}
          </div>
          <h2 className="font-display text-xl font-semibold text-white">Smart Serve Salon</h2>
          {salon?.customerName ? (
            <p className="mt-1 text-sm text-white/60">
              Client: <span className="text-white font-medium">{salon.customerName}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/30 italic">Waiting for client details…</p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {salon?.appointment?.confirmedSlot ? (() => {
            const parsed = parseSlotId(salon.appointment.confirmedSlot);
            return (
              <div className="flex flex-col gap-3">
                {/* Services — one row per service */}
                {(salon.appointment.services.length > 0 ? salon.appointment.services : ["—"]).map((svc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/[0.06] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✂️</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{svc}</p>
                        <p className="text-xs text-white/40">Service</p>
                      </div>
                    </div>
                    {i === 0 && <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-medium text-green-400">Booked</span>}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Date</p>
                    <p className="text-sm font-medium text-white">{parsed?.date ?? salon.appointment.confirmedSlot}</p>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Time</p>
                    <p className="text-sm font-semibold text-green-400">{parsed?.time ?? "—"}</p>
                  </div>
                </div>
              </div>
            );
          })() : salon?.appointment?.selectedSlots?.length ? (
            <div className="flex flex-col gap-4">
              {/* Services during select */}
              {(salon.appointment.services.length > 0 ? salon.appointment.services : ["—"]).map((svc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <span className="text-xl">✂️</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{svc}</p>
                    <p className="text-xs text-white/40">Service</p>
                  </div>
                </div>
              ))}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2.5">Available Slots</p>
                <div className="grid grid-cols-2 gap-2">
                  {salon.appointment.selectedSlots.map((slotId) => {
                    const p = parseSlotId(slotId);
                    return (
                      <div key={slotId} className="rounded-xl border px-3 py-2.5 text-center"
                        style={{ borderColor: `${accent}55`, background: `${accent}10` }}>
                        <p className="text-xs font-semibold" style={{ color: accent }}>{p?.time ?? slotId}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{p?.date ?? ""}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-white/30 text-center mt-3">Waiting for confirmation…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <span className="text-xl">✂️</span>
                <div>
                  <p className="text-sm text-white/20">—</p>
                  <p className="text-xs text-white/40">Service</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Date</p>
                  <p className="text-sm text-white/20">—</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Time</p>
                  <p className="text-sm text-white/20">—</p>
                </div>
              </div>
            </div>
          )}

          {callEnded && (
            <button type="button" onClick={onClear}
              className="mt-4 w-full rounded-full border border-white/10 bg-white/[0.05] py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80">
              Start new call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parse a slot_id like "today_2pm" or "tomorrow_10_30am" into { date, time }.
// Format: {date}_{hour}[_{minutes}]{am|pm}
// ---------------------------------------------------------------------------
function parseSlotId(slotId: string): { date: string; time: string } | null {
  if (!slotId) return null;
  const underscoreIdx = slotId.indexOf("_");
  if (underscoreIdx === -1) return null;

  const datePart = slotId.slice(0, underscoreIdx);          // "today" | "tomorrow"
  const timePart = slotId.slice(underscoreIdx + 1);         // "2pm" | "10_30am"

  // Normalise time: replace inner underscore (minute separator) with ":"
  // "2pm" → "2pm", "10_30am" → "10:30am"
  const normalised = timePart.replace(/_(\d{2})(am|pm)$/i, ":$1$2");
  const match = normalised.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i);
  if (!match) return null;

  const h = parseInt(match[1]);
  const m = match[2] ?? "00";
  const ampm = match[3].toUpperCase();
  const time = `${h}:${m.padStart(2, "0")} ${ampm}`;

  return { date: resolveDate(datePart), time };
}

// ---------------------------------------------------------------------------
// Resolve relative date words ("today", "tomorrow") to a real formatted date.
// Any other value is returned as-is so Vapi-supplied formatted strings pass through.
// ---------------------------------------------------------------------------
function resolveDate(raw: string): string {
  const lower = raw.toLowerCase().trim();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (lower === "today") return fmt(new Date());
  if (lower === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return fmt(d);
  }

  // Try to parse a date string Vapi might send (e.g. "2025-06-04", "June 4")
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) return fmt(parsed);

  // Fall back to whatever Vapi sent
  return raw;
}

// ---------------------------------------------------------------------------
// Deep-scan any object for tool calls by function name
// Returns every match found anywhere in the structure, with its id + parsed args
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepFindCalls(obj: any, fnName: string, seen: Set<string>, results: { id: string; args: Record<string, unknown> }[] = []) {
  if (!obj || typeof obj !== "object") return results;
  if (Array.isArray(obj)) {
    for (const item of obj) deepFindCalls(item, fnName, seen, results);
    return results;
  }
  // A valid tool-call node has BOTH an id AND a function.name — require both
  // to avoid matching the inner { name, arguments } object a second time
  const nodeName: string = obj?.function?.name ?? "";
  const nodeId: string = String(obj?.id ?? obj?.call_id ?? "");
  if (nodeName === fnName && nodeId) {
    if (!seen.has(nodeId)) {
      seen.add(nodeId);
      try {
        const raw = obj?.function?.arguments ?? "{}";
        const args = typeof raw === "string" ? JSON.parse(raw) : raw;
        results.push({ id: nodeId, args });
      } catch { /* ignore */ }
    }
    // Do NOT recurse further — we already consumed this node
    return results;
  }
  for (const val of Object.values(obj)) deepFindCalls(val, fnName, seen, results);
  return results;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HearPage() {
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData]   = useState<OrderData | null>(null);
  const [dentalData, setDentalData] = useState<DentalData | null>(null);
  const [salonData,  setSalonData]  = useState<SalonData  | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const seenToolCallIds = useRef<Set<string>>(new Set());
  // Incremented on every new call. Captured in each message-handler closure so
  // events from a previous (shutting-down) Vapi instance are silently dropped.
  const callKeyRef = useRef(0);

  function dbg(msg: string) { console.log("[SmartServe]", msg); }

  // Restaurant panel visibility
  const showOrder =
    active === "restaurant" ||
    (orderData !== null && (orderData.items.length > 0 || orderData.customerName !== ""));
  const orderCallEnded =
    active === null && orderData !== null &&
    (orderData.items.length > 0 || orderData.customerName !== "");

  // Panel opens as soon as the dental call starts or data exists post-call
  const showDental =
    active === "dental" ||
    (dentalData !== null && (dentalData.appointment !== null || dentalData.isEmergency));
  const dentalCallEnded = active === null && showDental;

  // Salon panel visibility
  const showSalon =
    active === "salon" ||
    (salonData !== null && salonData.appointment !== null);
  const salonCallEnded = active === null && showSalon;

  // Expand page when any panel is visible
  const anyPanelOpen = showOrder || showDental || showSalon;

  // Shared handler — called from both tool-calls and conversation-update paths.
  // Operations are idempotent so double-processing is harmless.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyDentalAppt = useCallback((args: Record<string, unknown>) => {
    const action   = String(args.action ?? "").toLowerCase();
    const service  = args.service ? String(args.service) : undefined;
    const slotIds: string[] = Array.isArray(args.slot_ids)
      ? (args.slot_ids as unknown[]).map(String)
      : args.slot_id ? [String(args.slot_id)]   // backwards-compat if singular still sent
      : [];

    if (action === "select") {
      setDentalData((prev) => ({
        customerName: prev?.customerName ?? "",
        isEmergency:  prev?.isEmergency  ?? false,
        appointment: {
          service:       service ?? prev?.appointment?.service ?? "Unknown Service",
          selectedSlots: slotIds,   // replace — always show only Mia's current offer
          confirmedSlot: prev?.appointment?.confirmedSlot,
        },
      }));
    } else if (action === "confirm") {
      setDentalData((prev) => ({
        customerName: prev?.customerName ?? "",
        isEmergency:  prev?.isEmergency  ?? false,
        appointment: {
          service:       service ?? prev?.appointment?.service ?? "Unknown Service",
          selectedSlots: [],
          confirmedSlot: slotIds[0] ?? prev?.appointment?.confirmedSlot,
        },
      }));
    } else if (action === "cancel") {
      setDentalData((prev) => {
        const remaining = (prev?.appointment?.selectedSlots ?? []).filter(
          (s) => !slotIds.includes(s),
        );
        return {
          customerName: prev?.customerName ?? "",
          isEmergency:  prev?.isEmergency  ?? false,
          appointment:  remaining.length > 0 || prev?.appointment?.confirmedSlot
            ? { service: prev?.appointment?.service ?? "Unknown Service", selectedSlots: remaining, confirmedSlot: prev?.appointment?.confirmedSlot }
            : null,
        };
      });
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applySalonAppt = useCallback((args: Record<string, unknown>) => {
    const action   = String(args.action ?? "").toLowerCase();
    // Tool sends "services" as an array of one or more service names
    const services: string[] = Array.isArray(args.services) && args.services.length > 0
      ? (args.services as unknown[]).map(String)
      : args.service ? [String(args.service)]
      : [];
    const slotIds: string[] = Array.isArray(args.slot_ids)
      ? (args.slot_ids as unknown[]).map(String)
      : args.slot_id ? [String(args.slot_id)]
      : [];

    if (action === "select") {
      setSalonData((prev) => ({
        customerName: prev?.customerName ?? "",
        appointment: {
          services:      services.length > 0 ? services : (prev?.appointment?.services ?? []),
          selectedSlots: slotIds,
          confirmedSlot: prev?.appointment?.confirmedSlot,
        },
      }));
    } else if (action === "confirm") {
      setSalonData((prev) => ({
        customerName: prev?.customerName ?? "",
        appointment: {
          services:      services.length > 0 ? services : (prev?.appointment?.services ?? []),
          selectedSlots: [],
          confirmedSlot: slotIds[0] ?? prev?.appointment?.confirmedSlot,
        },
      }));
    } else if (action === "cancel") {
      setSalonData((prev) => {
        const remaining = (prev?.appointment?.selectedSlots ?? []).filter(
          (s) => !slotIds.includes(s),
        );
        return {
          customerName: prev?.customerName ?? "",
          appointment:  remaining.length > 0 || prev?.appointment?.confirmedSlot
            ? { services: prev?.appointment?.services ?? [], selectedSlots: remaining, confirmedSlot: prev?.appointment?.confirmedSlot }
            : null,
        };
      });
    }
  }, []);

  // Generic Vapi call starter
  const startCall = useCallback(async (industryId: string, assistantId: string) => {
    // Kill any previous Vapi instance FIRST — prevents its lingering
    // conversation-update messages from re-stamping stale tool data after
    // seenToolCallIds is cleared below.
    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch { /* ignore */ }
      vapiRef.current = null;
    }

    setError(null);
    setLoading(true);
    // Stamp this call — captured in the closure below so any lingering
    // message events from the previous Vapi instance are silently ignored.
    callKeyRef.current += 1;
    const myCallKey = callKeyRef.current;
    seenToolCallIds.current.clear();
    if (industryId === "restaurant") setOrderData(null);
    if (industryId === "dental")     setDentalData(null);
    if (industryId === "salon")      setSalonData(null);

    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on("message", (msg: any) => {
        // Drop every event that belongs to a previous call
        if (callKeyRef.current !== myCallKey) return;

        // ── Transcript logging ───────────────────────────────────────────────
        if (msg.type === "transcript") {
          console.log("[SmartServe][TRANSCRIPT]", JSON.stringify(msg));
        }

        // ── Tool-calls: client must respond with a result or Vapi times out ──
        // This also lets us read the args immediately, before conversation-update.
        if (msg.type === "tool-calls") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const toolCallList: any[] = msg.toolCallList ?? [];

          // Process dental tools from tool-calls so UI updates instantly
          for (const tc of toolCallList) {
            const fnName: string = tc?.function?.name ?? "";
            let args: Record<string, unknown> = {};
            try {
              const raw = tc?.function?.arguments ?? "{}";
              args = typeof raw === "string" ? JSON.parse(raw) : raw;
            } catch { /* ignore */ }

            // ── Log every tool call so we can spot unexpected names ──────────
            console.log("[SmartServe][TOOL-CALL]", fnName, JSON.stringify(args, null, 2));

            // ── Update UI state ────────────────────────────────────────────
            if (industryId === "dental") {
              if (fnName === "SMARTSERVEDENTALDEMOAPPOINTMENT") {
                console.log("[SmartServe][DENTAL-APPT] args →", JSON.stringify(args, null, 2));
                applyDentalAppt(args);
              }

              if (fnName === "SMARTSERVEDENTALEMERGENCY" && Object.keys(args).length > 0) {
                console.log("[SmartServe][DENTAL-EMERGENCY] args →", JSON.stringify(args, null, 2));
                setDentalData((prev) => ({
                  customerName: prev?.customerName ?? "",
                  appointment: prev?.appointment ?? null,
                  isEmergency: true,
                  emergencyReason: args.reason ? String(args.reason) : undefined,
                }));
              }

              if (fnName === "smartserve_demo_set_customer_name") {
                console.log("[SmartServe][DENTAL-NAME] args →", JSON.stringify(args, null, 2));
                if (args.name) {
                  setDentalData((prev) => ({
                    ...(prev ?? { appointment: null, isEmergency: false }),
                    customerName: String(args.name).trim(),
                  }));
                }
              }
            }

            if (industryId === "salon") {
              if (fnName === "Smartserve_saloon_demo") {
                console.log("[SmartServe][SALON-APPT] args →", JSON.stringify(args, null, 2));
                applySalonAppt(args);
              }

              if (fnName === "smartserve_demo_set_customer_name") {
                console.log("[SmartServe][SALON-NAME] args →", JSON.stringify(args, null, 2));
                if (args.name) {
                  setSalonData((prev) => ({
                    ...(prev ?? { appointment: null }),
                    customerName: String(args.name).trim(),
                  }));
                }
              }
            }
          }
          return; // conversation-update will also carry these — dedup via seenToolCallIds
        }

        // Only process conversation-update messages for everything else.
        if (msg.type !== "conversation-update") return;

        // ── Restaurant: order items ──────────────────────────────────────────
        if (industryId === "restaurant") {
          const orderCalls = deepFindCalls(msg, "smartserve_restaurant_demo_takeorder", seenToolCallIds.current);
          if (orderCalls.length > 0) {
            setOrderData((prev) => {
              let state: OrderData = prev ?? { customerName: "", items: [] };
              for (const { args } of orderCalls) {
                state = applyOrderAction(
                  state,
                  args.action as OrderAction,
                  String(args.item ?? ""),
                  parseFloat(String(args.price ?? 0)),
                  parseInt(String(args.quantity ?? 1)),
                  args.is_free === true,
                  args.spice_level as string | undefined,
                  Array.isArray(args.modifications) ? args.modifications as string[] : undefined,
                );
              }
              return state;
            });
          }
        }

        // ── Dental ───────────────────────────────────────────────────────────
        if (industryId === "dental") {
          const apptCalls = deepFindCalls(msg, "SMARTSERVEDENTALDEMOAPPOINTMENT", seenToolCallIds.current);
          for (const { args } of apptCalls) applyDentalAppt(args);

          const emergCalls = deepFindCalls(msg, "SMARTSERVEDENTALEMERGENCY", seenToolCallIds.current);
          if (emergCalls.length > 0) {
            const { args } = emergCalls[0];
            if (Object.keys(args).length > 0) {
              setDentalData((prev) => ({
                customerName: prev?.customerName ?? "",
                appointment: prev?.appointment ?? null,
                isEmergency: true,
                emergencyReason: args.reason ? String(args.reason) : undefined,
              }));
            }
          }
        }

        // ── Salon ─────────────────────────────────────────────────────────────
        if (industryId === "salon") {
          const salonCalls = deepFindCalls(msg, "Smartserve_saloon_demo", seenToolCallIds.current);
          for (const { args } of salonCalls) applySalonAppt(args);
        }

        // ── Shared: customer name (all industries) ───────────────────────────
        const nameCalls = deepFindCalls(msg, "smartserve_demo_set_customer_name", seenToolCallIds.current);
        if (nameCalls.length > 0) console.log("[SmartServe][NAME-conv-update] args →", JSON.stringify(nameCalls[0].args, null, 2));
        if (nameCalls.length > 0 && nameCalls[0].args.name) {
          const name = String(nameCalls[0].args.name).trim();
          if (industryId === "restaurant") {
            setOrderData((prev) => ({ customerName: name, items: prev?.items ?? [] }));
          }
          if (industryId === "dental") {
            setDentalData((prev) => ({ ...(prev ?? { appointment: null, isEmergency: false }), customerName: name }));
          }
          if (industryId === "salon") {
            setSalonData((prev) => ({ ...(prev ?? { appointment: null }), customerName: name }));
          }
        }
      });

      vapi.on("call-end", () => {
        setTimeout(() => { setActive(null); setLoading(false); }, 300);
        vapiRef.current = null;
      });

      vapi.on("error", (err: unknown) => {
        // Daily.co fires a structurally-empty error object on normal call-end.
        // Object.keys() misses non-enumerable properties, so use JSON.stringify
        // to reliably detect the noise and swallow it.
        const isNoisy =
          err == null ||
          (typeof err === "object" && err !== null && JSON.stringify(err) === "{}") ||
          (err instanceof Error && !err.message);
        if (isNoisy) return;

        console.error("Vapi error", err);
        setError("Could not connect. Check microphone permissions and try again.");
        setActive(null);
        setLoading(false);
        vapiRef.current = null;
      });

      await vapi.start(assistantId);
      setActive(industryId);
    } catch (err) {
      console.error(err);
      setError("Failed to start the call. Please try again.");
      vapiRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [applyDentalAppt, applySalonAppt]);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
    vapiRef.current = null;
    setActive(null);
    setLoading(false);
  }, []);

  const ASSISTANT_IDS: Record<string, string> = {
    restaurant: RESTAURANT_ASSISTANT_ID,
    dental:     DENTAL_ASSISTANT_ID,
    salon:      SALON_ASSISTANT_ID,
  };

  function handleMic(id: string, vapiEnabled: boolean) {
    if (!vapiEnabled) return;
    if (active === id) endCall();
    else startCall(id, ASSISTANT_IDS[id]);
  }

  // suppress unused warning for dbg
  void dbg;

  const isRinging = active !== null;

  return (
    <div className="min-h-screen bg-[#06142b] text-white">
      <HeroNav />

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at 50% 25%, rgba(95,195,232,0.12) 0%, rgba(6,20,43,0) 55%)" }}
      />

      <main
        className="relative z-10 mx-auto px-6 pb-24 pt-32 transition-all duration-500"
        style={{ maxWidth: anyPanelOpen ? "1100px" : "672px" }}
      >
        {/* Phone + heading — always centered */}
        <div className="mb-6 flex justify-center">
          <RetroPhone ringing={isRinging} />
        </div>
        <div className="mb-12 text-center">
          <p className="text-sm font-medium tracking-widest uppercase transition-colors"
            style={{ color: isRinging ? "#5fc3e8" : "rgba(255,255,255,0.3)" }}>
            {loading ? "Connecting…" : isRinging ? "Live call in progress — speak now" : "Select an industry to hear a live call"}
          </p>
        </div>
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Hear Smart Serve <span className="text-[#5fc3e8]">handle a real call</span>
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Press the mic next to Restaurant or Dental to speak with the AI live.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-[#e8533f]/30 bg-[#e8533f]/10 px-4 py-3 text-sm text-[#e8533f]">
            {error}
          </div>
        )}

        {/* Two-column layout — splits when call is active */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* LEFT — industry cards */}
          <div className="flex-1 flex flex-col gap-4 transition-all duration-500">
            {INDUSTRIES.map((ind) => {
              const isActive = active === ind.id;
              return (
                <div key={ind.id}>
                  <div
                    className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur transition-all"
                    style={isActive ? { borderColor: `${ind.accent}55`, background: `${ind.accent}0d`, boxShadow: `0 0 40px ${ind.glow}` } : undefined}
                  >
                    <span className="text-3xl">{ind.emoji}</span>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-white">{ind.label}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {ind.vapiEnabled ? ind.tag : `${ind.tag} — coming soon`}
                      </p>
                    </div>
                    {isActive && <Waveform accent={ind.accent} />}
                    <MicButton
                      active={isActive}
                      loading={loading && isActive}
                      accent={ind.accent}
                      disabled={!ind.vapiEnabled || (active !== null && !isActive)}
                      onClick={() => handleMic(ind.id, ind.vapiEnabled)}
                    />
                  </div>

                  {ind.id === "restaurant" && (
                    <MenuPanel visible={isActive} />
                  )}
                  {ind.id === "dental" && (
                    <DentalServicesPanel visible={isActive} />
                  )}
                  {ind.id === "salon" && (
                    <SalonServicesPanel visible={isActive} />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT — order receipt (restaurant) */}
          <OrderPanel
            order={orderData}
            visible={showOrder}
            callEnded={orderCallEnded}
            onClear={() => setOrderData(null)}
          />

          {/* RIGHT — dental appointment panel */}
          <DentalPanel
            dental={dentalData}
            visible={showDental}
            callEnded={dentalCallEnded}
            onClear={() => setDentalData(null)}
          />

          {/* RIGHT — salon appointment panel */}
          <SalonPanel
            salon={salonData}
            visible={showSalon}
            callEnded={salonCallEnded}
            onClear={() => setSalonData(null)}
          />
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Your browser will ask for microphone permission when you start a call.
        </p>
        <div className="mt-10 text-center">
          <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/60">
            ← Back to Smart Serve
          </Link>
        </div>
      </main>

      <style>{`
        @keyframes phone-ring {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(-12deg); }
          30%  { transform: rotate(10deg); }
          45%  { transform: rotate(-8deg); }
          60%  { transform: rotate(6deg); }
          75%  { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
