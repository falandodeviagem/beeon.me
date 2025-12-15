/**
 * Skip to Content Link - Accessibility Component
 * 
 * Provides keyboard users a way to skip repetitive navigation
 * and jump directly to main content.
 * 
 * Usage: Place at the very top of your app layout, before header/nav
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem',
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        textDecoration: 'none',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '1rem';
        e.currentTarget.style.top = '1rem';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
}
