import { ProfileFloatingSupport } from "../components/profile-floating-support";
import { ProfilePageHeader } from "../components/profile-page-header";
import { ProfileSidebar } from "../components/profile-sidebar";
import { ServiceHistoryList } from "../components/service-history-list";

export function ProfileServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileSidebar activeItem="services" />
      <main className="mx-auto w-full max-w-6xl p-4 pb-24 md:p-6 lg:ml-64">
        <ProfilePageHeader
          titleKey="serviceHistory.headerTitle"
          subtitleKey="serviceHistory.headerSubtitle"
        />
        <ServiceHistoryList />
      </main>
      <ProfileFloatingSupport />
    </div>
  );
}
