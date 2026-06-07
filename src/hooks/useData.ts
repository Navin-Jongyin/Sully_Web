import { useContext } from 'react';
import { DataContext } from '../context/data-context';

export const useData = () => {
  const ctx = useContext(DataContext);
  if (ctx === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};
