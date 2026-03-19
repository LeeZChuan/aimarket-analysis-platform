import { useState, useRef, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { ChartPanel } from '../../components/ChartPanel';
import { ChatPanel } from '../../components/AIAssistant';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { LAYOUT_CONFIG } from '../../config/layout';

export function TradingView() {
  const [showSidebar, setShowSidebar] = useState(
    () => (window.innerWidth < 1024 ? false : LAYOUT_CONFIG.sidebar.defaultVisible)
  );
  const [showChat, setShowChat] = useState(
    () => (window.innerWidth < 1280 ? false : LAYOUT_CONFIG.chatPanel.defaultVisible)
  );
  const [sidebarWidth, setSidebarWidth] = useState(LAYOUT_CONFIG.sidebar.defaultWidth);
  const [chatWidth, setChatWidth] = useState(LAYOUT_CONFIG.chatPanel.defaultWidth);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isResizingSidebar = useRef(false);
  const isResizingChat = useRef(false);
  const isMobile = viewportWidth < 1024;
  const isCompact = viewportWidth < 1280;
  const effectiveSidebarWidth = isCompact ? Math.min(sidebarWidth, 300) : sidebarWidth;
  const effectiveChatWidth = isCompact ? Math.min(chatWidth, 340) : chatWidth;

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && showChat) {
      setShowChat(false);
    }
    if (isCompact && showSidebar && showChat) {
      setShowChat(false);
    }
  }, [isMobile, isCompact, showSidebar, showChat]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = e.clientX;
        if (newWidth >= LAYOUT_CONFIG.sidebar.minWidth && newWidth <= LAYOUT_CONFIG.sidebar.maxWidth) {
          setSidebarWidth(newWidth);
        }
      } else if (isResizingChat.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= LAYOUT_CONFIG.chatPanel.minWidth && newWidth <= LAYOUT_CONFIG.chatPanel.maxWidth) {
          setChatWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingChat.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSidebarToggle = () => {
    setShowSidebar((prev) => {
      const next = !prev;
      if (next && isCompact) {
        setShowChat(false);
      }
      return next;
    });
  };

  const handleChatToggle = () => {
    if (isMobile) return;
    setShowChat((prev) => {
      const next = !prev;
      if (next && isCompact) {
        setShowSidebar(false);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="h-10 flex items-center justify-between px-2 sm:px-3"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)'
        }}
      >
        <div className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
          {isMobile ? '移动端模式' : isCompact ? '紧凑布局' : '桌面布局'}
        </div>
        <div className="flex items-center gap-1.5">
        <ThemeSwitcher />
        <button
          onClick={handleSidebarToggle}
          className="p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          style={{
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={showSidebar ? '收起左侧栏' : '展开左侧栏'}
        >
          {showSidebar ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>
        {!isMobile && (
          <button
            onClick={handleChatToggle}
            className="p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            style={{
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={showChat ? '收起右侧栏' : '展开右侧栏'}
          >
            {showChat ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {showSidebar && (
          <>
            <div style={{ width: `${effectiveSidebarWidth}px` }} className="flex-shrink-0 overflow-hidden">
              <Sidebar />
            </div>
            {!isCompact && (
              <div
                className="w-1 cursor-col-resize transition-colors flex-shrink-0"
                style={{
                  background: 'var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--border-primary)';
                }}
                onMouseDown={(e) => {
                  isResizingSidebar.current = true;
                  e.preventDefault();
                }}
              />
            )}
          </>
        )}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChartPanel />
        </div>
        {showChat && (
          <>
            {!isCompact && (
              <div
                className="w-1 cursor-col-resize transition-colors flex-shrink-0"
                style={{
                  background: 'var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--border-primary)';
                }}
                onMouseDown={(e) => {
                  isResizingChat.current = true;
                  e.preventDefault();
                }}
              />
            )}
            <div style={{ width: `${effectiveChatWidth}px` }} className="flex-shrink-0 overflow-hidden">
              <ChatPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
