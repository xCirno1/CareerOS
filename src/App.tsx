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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
