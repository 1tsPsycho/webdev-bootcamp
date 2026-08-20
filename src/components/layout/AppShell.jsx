import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { ProfileGateModal } from '../profile/ProfileGateModal';
import { useAppData } from '../../state/AppDataContext';

export function AppShell() {
  const { activeName } = useAppData();

  return (
    <div className="min-h-screen flex flex-col">
      <ProfileGateModal />
      {activeName && <Nav />}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeName ? <Outlet /> : null}
      </main>
      {activeName && <Footer />}
    </div>
  );
}
