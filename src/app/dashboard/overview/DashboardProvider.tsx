'use client';

import React, { createContext, useContext } from 'react';

export const DashboardContext = createContext<DashboardData | null>(null);
type DashboardData = {
  lastSync: string;
  statistics: any[] | null;
  numberTypeSub: any[] | null;
  averageYearType: any[] | null;
  countByType: any[] | null;
  countByTypeByYear: any[] | null;
  valueEleByYear: any[] | null;
  dadosPetroliferos: any[] | null;
};

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

export default function DashboardProvider({
  value,
  children
}: {
  value: DashboardData | null;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
