import type { Metadata } from 'next';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { FormField, Input, Button } from '@/components/ui';

/** /contact - 联系我们 */
export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-16 md:py-20">
        <div className="text-center">
          <LotusMark className="mx-auto h-10 w-10 text-brand" />
          <h1 className="mt-4 font-display text-3xl md:text-4xl">Get in Touch</h1>
          <p className="mt-3 text-muted">
            Questions about an order, a piece, or a custom request? We typically reply within 24 hours.
          </p>
        </div>

        <form className="mt-10 space-y-4 rounded-lg border border-border bg-surface p-6 md:p-8" /* action={sendContactEmail} Phase 3 */>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required /></FormField>
            <FormField label="Email" htmlFor="email" required><Input id="email" name="email" type="email" required /></FormField>
          </div>
          <FormField label="Order Number (optional)" htmlFor="order"><Input id="order" name="order" placeholder="NC-10042" /></FormField>
          <FormField label="Subject" htmlFor="subject" required>
            <select id="subject" name="subject" required className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-brand focus:outline-none">
              <option value="">Select…</option>
              <option>Order inquiry</option>
              <option>Product question</option>
              <option>Return or exchange</option>
              <option>Wholesale</option>
              <option>Other</option>
            </select>
          </FormField>
          <FormField label="Message" htmlFor="message" required>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              placeholder="How can we help?"
            />
          </FormField>
          <Button type="submit">Send Message</Button>
        </form>

        {/* 直接联系方式 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted">Email</p>
            <a href="mailto:hello@naracharm.com" className="mt-1 block text-brand hover:underline">hello@naracharm.com</a>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted">Response Time</p>
            <p className="mt-1">Within 24 hours</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
