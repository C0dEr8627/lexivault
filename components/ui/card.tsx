import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  const classes = ["ui-card", className].filter(Boolean).join(" ");

  return <section className={classes}>{children}</section>;
}
