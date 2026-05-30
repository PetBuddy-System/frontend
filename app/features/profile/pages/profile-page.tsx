import { useSidebar } from "~/providers/sidebar-provider";
import { cn } from "~/shared/lib/cn";
import { ProfileFloatingSupport } from "../components/profile-floating-support";
import { ProfileInfoCard } from "../components/profile-info-card";
import { ProfilePageHeader } from "../components/profile-page-header";
import { ProfilePetsCard } from "../components/profile-pets-card";
import { ProfileSidebar } from "../components/profile-sidebar";
import { ProfileStats } from "../components/profile-stats";

export function ProfilePage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileSidebar activeItem="profile" />
      <main
        className={cn(
          "w-full p-4 pb-24 md:p-6 transition-all duration-300",
          isCollapsed
            ? "lg:ml-20 lg:w-[calc(100%-5rem)]"
            : "lg:ml-64 lg:w-[calc(100%-16rem)]"
        )}
      >
        <ProfilePageHeader />

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <ProfileStats />

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
            <ProfileInfoCard />
          </div>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
            <ProfilePetsCard />
          </div>
        </div>
      </main>
      <ProfileFloatingSupport />
    </div>
  );
}
