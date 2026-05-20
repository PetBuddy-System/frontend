import { cn } from "~/shared/lib/cn";

export interface MaterialIconProps {
  name: string;
  className?: string;
}

export function MaterialIcon({ name, className }: MaterialIconProps) {
  return (
    <span className={cn("material-symbols-outlined", className)} aria-hidden>
      {name}
    </span>
  );
}
