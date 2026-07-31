import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import DesktopHeader from './components/layout/DesktopHeader';
import MobileHeader from './components/layout/MobileHeader';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          {/* MobileHeader et Sidebar ne s'affichent jamais en même temps :
              c'est le CSS (media queries) qui décide lequel montrer selon la largeur d'écran */}
          <MobileHeader />

          <div className="app-body">
            <Sidebar />

            <div className="app-content">
              {/* DesktopHeader ne s'affiche qu'en desktop, à côté de la Sidebar */}
              <DesktopHeader />
              <main className="page">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </div>

          {/* BottomNav ne s'affiche qu'en mobile, voir styles/layout/bottom-nav.css */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
