'use client';

import { useState } from 'react';
import { FormField, Input, Button } from '@/components/ui';
import { authClient } from '@/lib/auth-client';

type Feedback = { text: string; error?: boolean } | null;

export default function ProfilePage() {
  const { data, refetch } = authClient.useSession();
  const [saving, setSaving] = useState<'profile' | 'password' | null>(null);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get('name') ?? '').trim();
    if (!name) {
      setProfileFeedback({ text: 'Enter the name you want to use.', error: true });
      return;
    }
    setSaving('profile');
    try {
      const response = await authClient.updateUser({ name });
      if (response.error) throw new Error(response.error.message || 'Could not save your name.');
      await refetch();
      setProfileFeedback({ text: 'Your name was saved.' });
    } catch (error) {
      setProfileFeedback({ text: error instanceof Error ? error.message : 'Could not save your name.', error: true });
    } finally {
      setSaving(null);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const currentPassword = String(values.get('currentPassword') ?? '');
    const newPassword = String(values.get('newPassword') ?? '');
    if (newPassword !== values.get('confirmPassword')) {
      setPasswordFeedback({ text: 'The new passwords do not match.', error: true });
      return;
    }
    setSaving('password');
    try {
      const response = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (response.error) throw new Error(response.error.message || 'Could not change your password.');
      form.reset();
      setPasswordFeedback({ text: 'Your password was changed.' });
    } catch (error) {
      setPasswordFeedback({ text: error instanceof Error ? error.message : 'Could not change your password.', error: true });
    } finally {
      setSaving(null);
    }
  }

  if (!data?.user) return null;
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl tracking-tight">Profile</h1>
      <form className="mt-6 space-y-4 rounded-sm border border-border bg-surface p-5 sm:p-6" onSubmit={saveProfile}>
        <h2 className="font-display text-2xl">Personal details</h2>
        <FormField label="Name" htmlFor="account-name" required><Input id="account-name" name="name" autoComplete="name" defaultValue={data.user.name} maxLength={100} required /></FormField>
        <FormField label="Sign-in email" htmlFor="account-email"><Input id="account-email" name="email" type="email" value={data.user.email} readOnly /></FormField>
        <Button type="submit" disabled={saving !== null}>{saving === 'profile' ? 'Saving…' : 'Save name'}</Button>
        {profileFeedback && <p role={profileFeedback.error ? 'alert' : 'status'} className="text-sm text-brand">{profileFeedback.text}</p>}
      </form>
      <form className="mt-6 space-y-4 rounded-sm border border-border bg-surface p-5 sm:p-6" onSubmit={savePassword}>
        <h2 className="font-display text-2xl">Change password</h2>
        <FormField label="Current password" htmlFor="currentPassword" required><Input id="currentPassword" name="currentPassword" autoComplete="current-password" type="password" required /></FormField>
        <FormField label="New password" htmlFor="newPassword" required hint="Use at least 8 characters."><Input id="newPassword" name="newPassword" autoComplete="new-password" type="password" minLength={8} required /></FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" required><Input id="confirmPassword" name="confirmPassword" autoComplete="new-password" type="password" minLength={8} required /></FormField>
        <Button type="submit" variant="outline" disabled={saving !== null}>{saving === 'password' ? 'Saving…' : 'Update password'}</Button>
        {passwordFeedback && <p role={passwordFeedback.error ? 'alert' : 'status'} className="text-sm text-brand">{passwordFeedback.text}</p>}
      </form>
    </div>
  );
}
