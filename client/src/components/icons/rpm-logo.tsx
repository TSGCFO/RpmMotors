interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-10" }: LogoProps) {
  return (
    <img
      src="/client/RPM Auto.png"
      alt="RPM Auto Logo"
      className={className}
    />
  );
}
