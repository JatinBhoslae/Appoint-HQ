import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import SmoothScroll from './components/ui/smooth-scroll';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <SmoothScroll>
            <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <AnimatedRoutes />
              </main>
            </div>
          </SmoothScroll>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
