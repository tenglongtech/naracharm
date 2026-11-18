export function DesignPalette({ palette }: { palette: readonly [string, string, string] }) {
  return (
    <div aria-hidden="true" className="grid h-full w-full grid-cols-[2fr_1fr_1fr]">
      {palette.map((color) => <div key={color} style={{ backgroundColor: color }} />)}
    </div>
  );
}
