import { useState } from 'react';
import { LayoutPanelLeft, LayoutPanelTop } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { ChartPanel } from '../components/ChartPanel';
import { ChatPanel } from '../components/ChatPanel';
import { LAYOUT_CONFIG } from '../config/layout';

type PanelState = 'all' | 'chart-only' | 'sidebar-chart' | 'chart-chat';

export function TradingView() {
  const [panelState, setPanelState] = useState<PanelState>('all');

  const toggleLayout = () => {
    setPanelState((prev) => {
      switch (prev) {
        case 'all':
          return 'chart-only';
        case 'chart-only':
          return 'all';
        case 'sidebar-chart':
          return 'chart-only';
        case 'chart-chat':
          return 'chart-only';
        default:
          return 'all';
      }
    });
  };

  const showSidebar = panelState === 'all' || panelState === 'sidebar-chart';
  const showChat = panelState === 'all' || panelState === 'chart-chat';

  return (
    <div className="h-full flex flex-col">
      <div className="h-5 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-end px-2 gap-1">
        <button
          onClick={toggleLayout}
          className="p-0.5 hover:bg-[#2A2A2A] rounded transition-colors"
          title={panelState === 'all' ? '切换到仅图表' : '切换到全部面板'}
        >
          {panelState === 'all' ? (
            <LayoutPanelTop className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <LayoutPanelLeft className="w-3.5 h-3.5 text-gray-400" />
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
