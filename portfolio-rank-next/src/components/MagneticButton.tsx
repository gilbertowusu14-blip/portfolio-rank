'use client';

import { useRef } from 'react';

function MagneticButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.05)`;
    btn.style.boxShadow = `0 0 30px rgba(245,158,11,0.6), 0 8px 25px rgba(245,158,11,0.3)`;
  };

  const handleMouseLeave = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0px, 0px) scale(1)';
    btn.style.boxShadow = '0 0 30px rgba(245,158,11,0.4)';
    btn.style.transition = 'transform 400ms ease-out, box-shadow 400ms ease-out';
  };

  const handleMouseEnter = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.transition = 'transform 100ms ease-out, box-shadow 100ms ease-out';
  };

  return (
    <a
      ref={buttonRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={className}
      style={{
        display: 'inline-block',
        padding: '16px 40px',
        fontSize: '18px',
        fontWeight: 700,
        borderRadius: '9999px',
        color: '#0a0a0a',
        background: '#f59e0b',
        boxShadow: '0 0 30px rgba(245,158,11,0.4)',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </a>
  );
}

export default MagneticButton;
