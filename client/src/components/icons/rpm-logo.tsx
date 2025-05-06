interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-16" }: LogoProps) {
  return (
    <img
      src="/logo/original/rpm_logo_new.png"
      alt="RPM Auto Logo"
      className={className}
      width="400"
      height="265"
      style={{ maxHeight: "80px", width: "auto" }}
    />
  );
}
