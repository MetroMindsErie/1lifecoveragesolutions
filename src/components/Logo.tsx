import logo from "figma:asset/c1916fca24a402e9827626e05b952c97898461d8.png";

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
  showText?: boolean; // NEW
}

export function Logo({ variant = "default", size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  const containerSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const radiusClasses = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative inline-flex items-center justify-center bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E] ${radiusClasses[size]} ${containerSizeClasses[size]} shadow-md ring-1 ring-black/5`}
      >
        <div className={`absolute inset-0 ${radiusClasses[size]} bg-white/5`} />
        <img
          src={logo}
          alt="1Life Coverage Solutions"
          className={`${sizeClasses[size]} relative z-10 object-contain ${radiusClasses[size]} bg-white shadow-sm ring-1 ring-gray-200`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`block tracking-tight ${
              variant === "light" ? "text-white" : "text-[#1a1a1a]"
            } ${size === "sm" ? "text-lg" : "text-xl"}`}
          >
            1Life
          </span>
          <span
            className={`block text-xs ${
              variant === "light" ? "text-white/80" : "text-[#6c757d]"
            }`}
          >
            Total Coverage.
          </span>
        </div>
      )}
    </div>
  );
}
