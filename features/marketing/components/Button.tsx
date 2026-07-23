import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VARIANTS = {
  primary: "bg-[var(--color-brand)] text-white hover:opacity-90",
  secondary: "bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-border)]",
};

const SIZES = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({ children, to, href, onClick, variant = "primary", size = "md", className = "" }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (to) return <Link to={to} className={classes}>{children}</Link>;
  if (href) return <a href={href} className={classes}>{children}</a>;
  return <button onClick={onClick} className={classes}>{children}</button>;
}
