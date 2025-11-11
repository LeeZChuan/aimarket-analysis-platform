import { useState, useRef, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { ChartPanel } from '../../components/ChartPanel';
import { ChatPanel } from '../../components/ChatPanel';
import { LAYOUT_CONFIG } from '../../config/layout';

export function TradingView() {
  const [showSidebar, setShowSidebar] = useState(LAYOUT_CONFIG.sidebar.defaultVisible);
  const [showChat, setShowChat] = useState(LAYOUT_CONFIG.chatPanel.defaultVisible);
  const [sidebarWidth, setSidebarWidth] = useState(LAYOUT_CONFIG.sidebar.defaultWidth);
  const [chatWidth, setChatWidth] = useState(LAYOUT_CONFIG.chatPanel.defaultWidth);
  const isResizingSidebar = useRef(false);
  const isResizingChat = useRef(false);

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
  });

  return (
    <div className="h-full flex flex-col">
      <div className="h-5 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-end px-2 gap-1">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-0.5 hover:bg-[#2A2A2A] rounded transition-colors"
          title={showSidebar ? '收起左侧栏' : '展开左侧栏'}
        >
          {showSidebar ? (
            <PanelLeftClose className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <PanelLeftOpen className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className="p-0.5 hover:bg-[#2A2A2A] rounded transition-colors"
          title={showChat ? '收起右侧栏' : '展开右侧栏'}
        >
          {showChat ? (
            <PanelRightClose className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <PanelRightOpen className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {showSidebar && (
          <>
            <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 overflow-hidden">
              <Sidebar />
            </div>
            <div
              className="w-1 bg-[#2A2A2A] hover:bg-[#3A9FFF] cursor-col-resize transition-colors flex-shrink-0"
              onMouseDown={(e) => {
                isResizingSidebar.current = true;
                e.preventDefault();
              }}
            />
          </>
        )}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChartPanel />
        </div>
        {showChat && (
          <>
            <div
              className="w-1 bg-[#2A2A2A] hover:bg-[#3A9FFF] cursor-col-resize transition-colors flex-shrink-0"
              onMouseDown={(e) => {
                isResizingChat.current = true;
                e.preventDefault();
              }}
            />
            <div style={{ width: `${chatWidth}px` }} className="flex-shrink-0 overflow-hidden">
              <ChatPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
