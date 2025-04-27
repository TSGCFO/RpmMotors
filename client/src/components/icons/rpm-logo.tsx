interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-16" }: LogoProps) {
  return (
    <img
      src="/logo/rpm-auto-logo.svg"
      alt="RPM Auto Logo"
      className={className}
      width="240"
      height="80"
    />
  );
}
