'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useMunicipio } from '@/hooks/use-municipio';

const MUNICIPIOS = [
  { value: 'regional', label: 'Alto Tâmega e Barroso (Regional)' },
  { value: '1', label: 'Boticas' },
  { value: '2', label: 'Chaves' },
  { value: '3', label: 'Montalegre' },
  { value: '4', label: 'Ribeira de Pena' },
  { value: '5', label: 'Valpaços' },
  { value: '6', label: 'Vila Pouca de Aguiar' },
];

export function MunicipioSelector() {
  const { municipio, setMunicipio } = useMunicipio();

  return (
    <div className="w-full md:w-72">
      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1 tracking-widest">
        Filtro Territorial
      </p>
      <Select value={municipio} onValueChange={setMunicipio}>
        <SelectTrigger className="font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MUNICIPIOS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
