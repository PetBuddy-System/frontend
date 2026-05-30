import { useSidebar } from "~/providers/sidebar-provider";
import { cn } from "~/shared/lib/cn";
import { ProfileFloatingSupport } from "../components/profile-floating-support";
import { ProfilePageHeader } from "../components/profile-page-header";
import { ProfileSidebar } from "../components/profile-sidebar";
import { ServiceHistoryList } from "../components/service-history-list";

export function ProfileServicesPage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileSidebar activeItem="services" />
      <main
        className={cn(
          "w-full p-4 pb-24 md:p-6 transition-all duration-300",
          isCollapsed
            ? "lg:ml-20 lg:w-[calc(100%-5rem)]"
            : "lg:ml-64 lg:w-[calc(100%-16rem)]"
        )}
      >
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
