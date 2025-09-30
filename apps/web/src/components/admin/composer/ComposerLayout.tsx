interface ComposerLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  actions?: React.ReactNode;
}

export function ComposerLayout({ left, right, actions }: ComposerLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky action bar */}
      {actions && (
        <div className="sticky top-14 z-10 bg-sabi-card dark:bg-sabi-card-dark border-b border-sabi-border dark:border-sabi-border-dark px-6 py-3">
          <div className="flex items-center justify-end gap-3">{actions}</div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex-1 p-6">
        <div className="lg:grid lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-6 space-y-6 lg:space-y-0">
          {/* Left panel */}
          <div className="space-y-6">{left}</div>

          {/* Right panel */}
          <div className="space-y-6">{right}</div>
        </div>
      </div>
    </div>
  );
}