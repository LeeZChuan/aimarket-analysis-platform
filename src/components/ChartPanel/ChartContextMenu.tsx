import { useEffect, useRef, useCallback } from 'react';
import type { KLineDataItem } from '../../store/useChartStore';

export interface ContextMenuActionContext {
  symbol: string;
  stockName: string;
  timeframe: string;
  startTime: string;
  endTime: string;
  klineData: KLineDataItem[];
}

export interface ContextMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  visible?: boolean;
  dividerAfter?: boolean;
  run: (ctx: ContextMenuActionContext) => void;
}

interface ChartContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  context: ContextMenuActionContext | null;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ChartContextMenu({
  visible,
  position,
  context,
  actions,
  onClose,
}: ChartContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleClickOutside, handleKeyDown]);

  useEffect(() => {
    if (!visible || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = position.x;
    let y = position.y;

    if (x + rect.width > vw) x = x - rect.width;
    if (y + rect.height > vh) y = y - rect.height;
    if (x < 4) x = 4;
    if (y < 4) y = 4;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [visible, position]);

  if (!visible || !context) return null;

  const visibleActions = actions.filter((a) => a.visible !== false);

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] min-w-[180px] rounded-lg shadow-xl py-1 animate-contextmenu-in"
      style={{
        left: -9999,
        top: -9999,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div
        className="px-3 py-2 text-[11px] flex items-center gap-1.5 select-none"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <span style={{ color: 'var(--accent-primary)' }}>{context.symbol}</span>
        <span>·</span>
        <span>{context.timeframe}</span>
        <span>·</span>
        <span>{context.klineData.length} 条K线</span>
      </div>

      {visibleActions.map((action) => (
        <div key={action.id}>
          <button
            onClick={() => {
              if (!action.disabled) {
                action.run(context);
                onClose();
              }
            }}
            disabled={action.disabled}
            className="w-full px-3 py-2 flex items-center gap-2 text-left text-xs transition-colors"
            style={{
              color: action.disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!action.disabled) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {action.icon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {action.icon}
              </span>
            )}
            <span>{action.label}</span>
          </button>
          {action.dividerAfter && (
            <div className="mx-2 my-1 h-px" style={{ background: 'var(--border-primary)' }} />
          )}
        </div>
      ))}

      <style>{`
        @keyframes contextmenu-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-contextmenu-in {
          animation: contextmenu-in 0.12s ease-out;
        }
      `}</style>
    </div>
  );
}
