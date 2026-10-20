import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { profileStrength } from "@/lib/lands";
import { Panel, ProgressBar } from "@/components/dashboard/Widgets";
import { PasswordForm, ProfileForm } from "@/components/dashboard/ProfileForms";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireUser(undefined, "/dashboard/profile");
  const strength = profileStrength(user);
  return (
    <div className="container-dash pt-8">
      <h1 className="text-[30px] font-semibold text-ink">My Profile</h1>
      <p className="text-[15px] text-muted">A complete profile builds trust and gets you better responses.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel>
          <ProfileForm user={user} />
        </Panel>
        <div className="space-y-6">
          <Panel>
            <p className="flex justify-between text-[15px] font-semibold text-ink">
              Profile Strength <span>{strength}%</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={strength} />
            </div>
            <p className="mt-2 text-[13px] text-muted">Add a photo, phone number and location details to reach 100%.</p>
          </Panel>
          <Panel>
            <h2 className="mb-4 text-[17px] font-semibold text-ink">Change Password</h2>
            <PasswordForm />
          </Panel>
        </div>
      </div>
    </div>
  );
}
