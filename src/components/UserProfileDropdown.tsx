import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Settings, Key, CheckCircle2, AlertCircle, ChevronDown, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface UserProfileDropdownProps {
  onOpenSettings?: () => void;
}

export default function UserProfileDropdown({ onOpenSettings }: UserProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('problemspace-user-api-key') || '' : '';
  const aiModel = typeof window !== 'undefined' ? localStorage.getItem('problemspace-ai-model') || 'gemini-2.0-flash' : 'gemini-2.0-flash';
  const hasKey = !!geminiKey;

  const calcPos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, []);

  const toggle = () => {
    if (!isOpen) { calcPos(); setIsOpen(true); }
    else setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Recompute on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => { calcPos(); };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [isOpen, calcPos]);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  const styles = {
    card: {
      position: 'fixed' as const,
      top: pos.top,
      right: pos.right,
      zIndex: 2147483647, // max z-index
      width: 280,
      backgroundColor: 'var(--color-cream)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-modal)',
      overflow: 'hidden' as const,
      opacity: 1,
    },
    band: {
      padding: 16,
      background: 'var(--color-cream-warm)',
      borderBottom: '1px solid var(--color-border)',
    },
    section: {
      padding: '10px 12px',
      borderBottom: '1px solid var(--color-border)',
    },
    row: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      padding: '6px 8px',
      borderRadius: 10,
      backgroundColor: 'var(--color-cream-warm)',
      marginBottom: 6,
    },
    actions: { padding: '6px 8px', backgroundColor: 'var(--color-cream)' },
    footer: { padding: '4px 16px 12px', backgroundColor: 'var(--color-cream)' },
    textPrimary: 'var(--color-ink)',
    textMuted: 'var(--color-ink-muted)',
  };

  const dropdown = (
    <div ref={dropdownRef} style={styles.card}>
      {/* Header band */}
      <div style={styles.band}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-lavender)', flexShrink: 0 }}>
            {user.picture
              ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'var(--color-ink)', color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials}</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: styles.textPrimary, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            <p style={{ fontSize: 11, color: styles.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Shield style={{ width: 10, height: 10, color: 'var(--color-ink-muted)' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Google Account Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence status */}
      <div style={styles.section}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: styles.textMuted, paddingLeft: 4, marginBottom: 6 }}>
          Intelligence Status
        </p>

        <div style={styles.row}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Key style={{ width: 13, height: 13, color: styles.textMuted }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: styles.textPrimary }}>Gemini API Key</span>
          </div>
          {hasKey
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--color-sage)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-sage)' }}>Active</span>
              </div>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <AlertCircle style={{ width: 13, height: 13, color: 'var(--color-amber)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-amber)' }}>Not Set</span>
              </div>
          }
        </div>

        <div style={{ ...styles.row, marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles style={{ width: 13, height: 13, color: 'var(--color-lavender)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: styles.textPrimary }}>Active Model</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-lavender)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiModel}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {onOpenSettings && (
          <button
            id="profile-open-settings"
            onClick={() => { setIsOpen(false); onOpenSettings(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none', marginBottom: 2 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-cream-warm)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--color-lavender-light)', border: '1px solid var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
              <Settings style={{ width: 13, height: 13, color: 'var(--color-ink)' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: styles.textPrimary, marginBottom: 1 }}>Intelligence Settings</p>
              <p style={{ fontSize: 10, color: styles.textMuted }}>API keys, model, memory config</p>
            </div>
          </button>
        )}

        <button
          id="profile-sign-out"
          onClick={() => { setIsOpen(false); logout(); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-rose-light)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--color-rose-light)', border: '1px solid var(--color-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
            <LogOut style={{ width: 13, height: 13, color: 'var(--color-rose)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-rose)', marginBottom: 1 }}>Sign Out</p>
            <p style={{ fontSize: 10, color: styles.textMuted }}>Clear session & return to login</p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{ fontSize: 9, textAlign: 'center', color: styles.textMuted, opacity: 0.5, fontWeight: 500 }}>
          ProblemSpace · Data stored locally on this device
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        id="profile-dropdown-trigger"
        onClick={toggle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-cream-warm)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s ease' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--color-ink)', flexShrink: 0 }}>
          {user.picture
            ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--color-ink)', color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{initials}</div>
          }
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name?.split(' ')[0] || user.email}
        </span>
        <ChevronDown style={{ width: 12, height: 12, color: 'var(--color-ink-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Portal — renders directly into document.body, bypasses all stacking contexts */}
      {isOpen && createPortal(dropdown, document.body)}
    </>
  );
}
