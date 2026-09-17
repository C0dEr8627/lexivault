import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "error";

type AlertProps = {
  title: string;
  children: ReactNode;
  tone?: AlertTone;
  className?: string;
};

export function Alert({ title, children, tone = "info", className = "" }: AlertProps) {
  const classes = ["ui-alert", `ui-alert-${tone}`, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role={tone === "error" ? "alert" : "status"}>
      <div className="ui-alert-title">{title}</div>
      <div className="ui-alert-copy">{children}</div>
    </div>
  );
}
