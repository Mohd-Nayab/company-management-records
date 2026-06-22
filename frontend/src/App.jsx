import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UploadCsv from './pages/UploadCsv.jsx';
import Records from './pages/Records.jsx';
import RecordDetails from './pages/RecordDetails.jsx';
import EditRecord from './pages/EditRecord.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import { useTheme } from './context/ThemeContext.jsx';

// Root component: defines routes and global toast container.
const App = () => {
  const { theme } = useTheme();

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadCsv />} />
          <Route path="records" element={<Records />} />
          <Route path="records/:id" element={<RecordDetails />} />
          <Route path="records/:id/edit" element={<EditRecord />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </>
  );
};

export default App;
