import { Routes, Route } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import ClientDetail from './pages/ClientDetail';
import NewClient from './pages/NewClient';
import Wizard from './pages/Wizard';
import Documentation from './pages/Documentation';

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients/new" element={<NewClient />} />
          <Route path="clients/:clientId" element={<ClientDetail />} />
          <Route path="wizard/:clientId/:platform" element={<Wizard />} />
          <Route path="docs" element={<Documentation />} />
          <Route path="docs/:category/:slug" element={<Documentation />} />
        </Route>
      </Routes>
    </AppProviders>
  );
}
