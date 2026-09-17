import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ open, title, description, children, footer }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-dialog-backdrop" role="presentation">
      <div className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="ui-dialog-header">
          <h2 id="dialog-title" className="page-title ui-dialog-title">
            {title}
          </h2>
          {description ? <p className="page-copy ui-dialog-copy">{description}</p> : null}
        </div>

        <div className="ui-dialog-body">{children}</div>

        {footer ? <div className="ui-dialog-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
