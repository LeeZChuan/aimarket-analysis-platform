import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationButton } from '../components/NavigationButton';
import { NavigationMenu } from '../components/NavigationMenu';

export function Layout() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="h-screen bg-[#0D0D0D] overflow-hidden">
      <NavigationButton onClick={() => setIsNavOpen(true)} />
      <NavigationMenu isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <Outlet />
    </div>
  );
}
