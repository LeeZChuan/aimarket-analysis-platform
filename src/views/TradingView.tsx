import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChartPanel } from '../components/ChartPanel';
import { ChatPanel } from '../components/ChatPanel';
import { NavigationButton } from '../components/NavigationButton';
import { NavigationMenu } from '../components/NavigationMenu';

export function TradingView() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="h-screen bg-[#0D0D0D] flex overflow-hidden">
      <NavigationButton onClick={() => setIsNavOpen(true)} />
      <NavigationMenu isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <Sidebar />
      <ChartPanel />
      <ChatPanel />
    </div>
  );
}
