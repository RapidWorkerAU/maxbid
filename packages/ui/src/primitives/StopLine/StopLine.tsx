/** Marker yellow bar used as the brand mark, tab marker, loader and bid limit marker. */
export function StopLine({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block h-1 bg-accent ${className}`} />;
}
