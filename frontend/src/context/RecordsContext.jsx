import { createContext, useContext } from 'react';
import useRecords from '../hooks/useRecords.js';

const RecordsContext = createContext();

/**
 * Wraps the useRecords hook so records state can be shared across pages.
 */
export const RecordsProvider = ({ children }) => {
  const records = useRecords();
  return <RecordsContext.Provider value={records}>{children}</RecordsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRecordsContext = () => {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecordsContext must be used within RecordsProvider');
  return ctx;
};
