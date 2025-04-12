interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-10" }: LogoProps) {
  return (
    <img
      src="/rpm-auto-logo.svg"
      alt="RPM Auto Logo"
      className={className}
    />
  );
}
