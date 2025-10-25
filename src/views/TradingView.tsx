import { Sidebar } from '../components/Sidebar';
import { ChartPanel } from '../components/ChartPanel';
import { ChatPanel } from '../components/ChatPanel';

export function TradingView() {
  return (
    <div className="h-full flex">
      <Sidebar />
      <ChartPanel />
      <ChatPanel />
    </div>
  );
}
