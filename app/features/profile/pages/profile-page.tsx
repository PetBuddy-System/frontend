import { ProfileFloatingSupport } from "../components/profile-floating-support";
import { ProfileInfoCard } from "../components/profile-info-card";
import { ProfilePageHeader } from "../components/profile-page-header";
import { ProfilePetsCard } from "../components/profile-pets-card";
import { ProfileSidebar } from "../components/profile-sidebar";
import { ProfileStats } from "../components/profile-stats";

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileSidebar activeItem="profile" />
      <main className="mx-auto w-full max-w-6xl p-4 pb-24 md:p-6 lg:ml-64">
        <ProfilePageHeader />

        <div className="grid grid-cols-12 gap-6">
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
