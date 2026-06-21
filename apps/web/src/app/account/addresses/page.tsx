import { FormField, Input, Button } from '@/components/ui';

/** /account/addresses - 地址簿 */
export default function AddressesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Addresses</h1>
      <p className="mt-2 text-muted">Save addresses for faster checkout.</p>

      {/* 已存地址 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-brand bg-brand/5 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs text-bg">Default</span>
            <button className="text-xs text-brand underline">Edit</button>
          </div>
          <p className="mt-3 font-medium">Emma Rivera</p>
          <p className="mt-1 text-sm text-muted">123 Linden St<br />Brooklyn, NY 11201<br />United States<br />+1 555 000 0000</p>
        </div>
        <div className="rounded-lg border border-dashed border-border p-5 text-muted">
          <button className="flex h-full w-full flex-col items-center justify-center text-sm hover:text-brand">
            <span className="text-2xl">+</span>
            Add new address
          </button>
        </div>
      </div>

      {/* 新增表单 (占位) */}
      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-xl">Add a New Address</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" htmlFor="firstName" required><Input id="firstName" required /></FormField>
          <FormField label="Last Name" htmlFor="lastName" required><Input id="lastName" required /></FormField>
          <div className="sm:col-span-2"><FormField label="Address" htmlFor="addr" required><Input id="addr" required /></FormField></div>
          <FormField label="City" htmlFor="city" required><Input id="city" required /></FormField>
          <FormField label="Postal Code" htmlFor="zip" required><Input id="zip" required /></FormField>
          <div className="sm:col-span-2">
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
