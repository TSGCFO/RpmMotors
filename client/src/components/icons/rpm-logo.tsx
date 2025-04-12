import logoImage from "../../assets/rpm-auto-logo.png";

interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-10" }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="RPM Auto Logo"
      className={className}
    />
  );
}
