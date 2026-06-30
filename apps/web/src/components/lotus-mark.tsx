/**
 * Lotus mark SVG (纯静态, server/client 都能用)
 */
export function LotusMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21c-4 0-7-3-7-7 0 0 3-1 7 4 4-5 7-4 7-4 0 4-3 7-7 7z" />
      <path d="M12 18c-2-2-3-5-3-8 0 0 1.5-1 3 1 1.5-2 3-1 3-1 0 3-1 6-3 8z" />
      <path d="M12 10c0-3 0-5 0-7" />
    </svg>
  );
}
