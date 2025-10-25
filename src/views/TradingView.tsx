import { Sidebar } from '../components/Sidebar';
import { ChartPanel } from '../components/ChartPanel';
import { ChatPanel } from '../components/ChatPanel';

export function TradingView() {
  return (
    <div className="h-screen bg-[#0D0D0D] flex overflow-hidden">
      <Sidebar />
      <ChartPanel />
      <ChatPanel />
    </div>
  );
}
