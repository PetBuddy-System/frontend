import { LandingBottomNav } from "~/features/landing/components/landing-bottom-nav";
import { LandingFab } from "~/features/landing/components/landing-fab";
import { LandingFooter } from "~/features/landing/components/landing-footer";
import { LandingHeader } from "~/features/landing/components/landing-header";

import { ServicesCombo } from "../components/services-combo";
import { ServicesGallery } from "../components/services-gallery";
import { ServicesHero } from "../components/services-hero";
import { ServicesIndividual } from "../components/services-individual";
import { ServicesPriceBoard } from "../components/services-price-board";

export function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1 pb-24 md:pb-0">
        <ServicesHero />
        <ServicesIndividual />
        <ServicesCombo />
        <ServicesPriceBoard />
        <ServicesGallery />
      </main>
      <LandingFooter />
      <LandingBottomNav />
      <LandingFab />
    </div>
  );
}
