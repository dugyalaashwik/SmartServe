import { SmoothScroll } from "@/components/marketing/SmoothScroll";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
