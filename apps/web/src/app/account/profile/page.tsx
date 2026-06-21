import { FormField, Input, Button, Divider } from '@/components/ui';

/** /account/profile - 个人资料 */
export default function ProfilePage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">Profile</h1>
      <p className="mt-2 text-muted">Manage your personal information.</p>

      {/* 基本信息 */}
      <form className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-xl">Personal Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" htmlFor="firstName"><Input id="firstName" defaultValue="Emma" /></FormField>
          <FormField label="Last Name" htmlFor="lastName"><Input id="lastName" defaultValue="Rivera" /></FormField>
        </div>
        <FormField label="Email" htmlFor="email"><Input id="email" type="email" defaultValue="emma@email.com" /></FormField>
        <Button type="submit">Save Changes</Button>
      </form>

      <Divider />

      {/* 改密码 */}
      <form className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-xl">Change Password</h2>
        <FormField label="Current Password" htmlFor="current" required><Input id="current" type="password" required /></FormField>
        <FormField label="New Password" htmlFor="new" required hint="At least 8 characters."><Input id="new" type="password" required /></FormField>
        <FormField label="Confirm New Password" htmlFor="confirm" required><Input id="confirm" type="password" required /></FormField>
        <Button type="submit" variant="outline">Update Password</Button>
      </form>
    </div>
  );
}
