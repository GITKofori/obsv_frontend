'use client';

import { create } from 'zustand';

interface MunicipioState {
  municipio: string;
  setMunicipio: (value: string) => void;
}

const useMunicipioStore = create<MunicipioState>((set) => ({
  municipio: 'regional',
  setMunicipio: (value: string) => set({ municipio: value }),
}));

export function useMunicipio() {
  const municipio = useMunicipioStore((s) => s.municipio);
  const setMunicipio = useMunicipioStore((s) => s.setMunicipio);

  return {
    municipio,
    setMunicipio,
    isRegional: municipio === 'regional',
    municipioId: municipio === 'regional' ? null : parseInt(municipio),
  };
}
