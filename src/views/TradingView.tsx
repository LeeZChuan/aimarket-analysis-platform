import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { ChartPanel } from '../components/ChartPanel';
import { ChatPanel } from '../components/ChatPanel';
import { LAYOUT_CONFIG } from '../config/layout';

export function TradingView() {
  const [showSidebar, setShowSidebar] = useState(LAYOUT_CONFIG.sidebar.defaultVisible);
  const [showChat, setShowChat] = useState(LAYOUT_CONFIG.chatPanel.defaultVisible);

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

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}
        <ChartPanel />
        {showChat && <ChatPanel />}
      </div>
    </div>
  );
}
