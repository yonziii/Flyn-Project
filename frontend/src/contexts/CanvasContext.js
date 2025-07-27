"use client";

import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { refreshSchema as apiRefreshSchema } from '@/lib/api';

// 1. Create the context
const CanvasContext = createContext(null);

// 2. Create the Provider component
export function CanvasProvider({ children }) {
  const [canvasName, setCanvasName] = useState('Loading Canvas...');
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshSchema = useCallback(async (id_to_refresh) => {
    if (!id_to_refresh) {
        toast.error("Canvas ID not found, cannot refresh.");
        console.error("No spreadsheetId available to refresh.");
        return;
    }

    setIsRefreshing(true);
    const toastId = toast.loading('Refreshing schema...');
    try {
        await apiRefreshSchema(id_to_refresh);
        toast.success('Schema refreshed successfully!', { id: toastId });
    } catch (error) {
        toast.error(error.message || 'Failed to refresh schema.', { id: toastId });
    } finally {
        setIsRefreshing(false);
    }
  }, []); // Dependency array can be empty as it no longer depends on state

  const value = useMemo(() => ({
    canvasName,
    setCanvasName,
    spreadsheetId,
    setSpreadsheetId,
    isRefreshing,
    refreshSchema,
  }), [canvasName, spreadsheetId, isRefreshing, refreshSchema]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}
// 3. Create a custom hook for easy access to the context
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}