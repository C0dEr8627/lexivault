import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  eyebrow?: string;
};

export function EmptyState({ title, description, action, eyebrow }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
      <h2 className="empty-state-title">{title}</h2>
      <p className="page-copy empty-state-copy">{description}</p>
      {action ? <div className="empty-state-actions">{action}</div> : null}
    </div>
  );
}
