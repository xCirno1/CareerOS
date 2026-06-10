import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { AppShell } from '@/layout/AppShell';
import { Landing } from '@/screens/Landing';
import { Onboarding } from '@/screens/Onboarding';
import { TraileersMap } from '@/screens/TraileersMap';
import { NodeDetail } from '@/screens/NodeDetail';
import { Assessment } from '@/screens/Assessment';
import { Routing } from '@/screens/Routing';

// Public layout and screens
import { PublicLayout } from '@/layout/PublicLayout';
import { Trailers } from '@/screens/Trailers';
import { Pricing } from '@/screens/Pricing';
import { About } from '@/screens/About';
import { Careers } from '@/screens/Careers';
import { Blog } from '@/screens/Blog';
import { Contact } from '@/screens/Contact';
import { HelpCenter } from '@/screens/HelpCenter';
import { Methodology } from '@/screens/Methodology';
import { Changelog } from '@/screens/Changelog';
import { Status } from '@/screens/Status';
import { Privacy } from '@/screens/Privacy';
import { Terms } from '@/screens/Terms';
import { Security } from '@/screens/Security';
import { Cookies } from '@/screens/Cookies';
import { Login } from '@/screens/Login';
import { TransitionLab } from '@/screens/TransitionLab';

function ShellRoute({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/_dev/transition-lab" element={<TransitionLab />} />
          <Route
            path="/map"
            element={
              <ShellRoute>
                <TraileersMap />
              </ShellRoute>
            }
          />
          <Route
            path="/node/:id"
            element={
              <ShellRoute>
                <NodeDetail />
              </ShellRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ShellRoute>
                <Assessment />
              </ShellRoute>
            }
          />
          <Route
            path="/routing"
            element={
              <ShellRoute>
                <Routing />
              </ShellRoute>
            }
          />

          {/* Public Footer Routes */}
          <Route path="/trailers" element={<PublicLayout><Trailers /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/help-center" element={<PublicLayout><HelpCenter /></PublicLayout>} />
          <Route path="/methodology" element={<PublicLayout><Methodology /></PublicLayout>} />
          <Route path="/changelog" element={<PublicLayout><Changelog /></PublicLayout>} />
          <Route path="/status" element={<PublicLayout><Status /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
          <Route path="/security" element={<PublicLayout><Security /></PublicLayout>} />
          <Route path="/cookies" element={<PublicLayout><Cookies /></PublicLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
