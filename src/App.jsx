import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './site/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import ServiceVolume from './pages/ServiceVolume.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function AdminLoading() {
  return (
    <div className="admin-loading" role="status">
      <span className="nib" aria-hidden="true" />
      <span>Opening the dashboard…</span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminLoading />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="services/:slug" element={<ServiceVolume />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
