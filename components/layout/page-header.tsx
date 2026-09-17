import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h1 className="page-title page-header-title">{title}</h1>
        <p className="page-copy page-header-description">{description}</p>
      </div>

      {action ? <div className="page-header-actions">{action}</div> : null}
    </header>
  );
}
