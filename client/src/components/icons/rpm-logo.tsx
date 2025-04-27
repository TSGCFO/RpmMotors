interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-16" }: LogoProps) {
  return (
    <img
      src="/logo/original/rpm_logo.png"
      alt="RPM Auto Logo"
      className={className}
      width="240"
      height="80"
    />
  );
}
