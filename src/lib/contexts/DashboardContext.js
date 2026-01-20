"use client";

import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [noteContext, setNoteContext] = useState({ noteId: null, noteContent: '' });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const value = {
    isAiSidebarOpen,
    setIsAiSidebarOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    noteContext,
    setNoteContext,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
