export function Logo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div className={`flex items-center ${compact ? "justify-center" : "gap-2"} ${className}`}>
      <img
        src="/images/logo.png"
        alt="TontiTrack"
        className={compact ? "h-9 w-9 object-contain" : "h-10 w-36 object-contain"}
      />
      {!compact && <span className="sr-only">TontiTrack</span>}
    </div>
  );
}
