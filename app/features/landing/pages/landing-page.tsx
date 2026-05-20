import { LandingBottomNav } from "../components/landing-bottom-nav";
import { LandingFab } from "../components/landing-fab";
import { LandingFooter } from "../components/landing-footer";
import { LandingHeader } from "../components/landing-header";
import { LandingHero } from "../components/landing-hero";
import { LandingProducts } from "../components/landing-products";
import { LandingServices } from "../components/landing-services";
import { LandingTrust } from "../components/landing-trust";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex flex-col pb-24 md:pb-0">
        <LandingHero />
        <LandingServices />
        <LandingProducts />
        <LandingTrust />
      </main>
      <LandingFooter />
      <LandingBottomNav />
      <LandingFab />
    </div>
  );
}
