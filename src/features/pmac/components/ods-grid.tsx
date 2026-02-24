'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface OdsGridProps {
  data: { ods_id: number; count: number }[];
}

const ODS_LABELS: Record<number, string> = {
  1: 'Erradicar a Pobreza',
  2: 'Erradicar a Fome',
  3: 'Saúde de Qualidade',
  4: 'Educação de Qualidade',
  5: 'Igualdade de Género',
  6: 'Água Potável e Saneamento',
  7: 'Energias Renováveis e Acessíveis',
  8: 'Trabalho Digno e Crescimento Económico',
  9: 'Indústria, Inovação e Infraestrutura',
  10: 'Reduzir as Desigualdades',
  11: 'Cidades e Comunidades Sustentáveis',
  12: 'Produção e Consumo Sustentáveis',
  13: 'Ação Climática',
  14: 'Proteger a Vida Marinha',
  15: 'Proteger a Vida Terrestre',
  16: 'Paz, Justiça e Instituições Eficazes',
  17: 'Parcerias para a Implementação dos Objetivos',
};

export function OdsGrid({ data }: OdsGridProps) {
  if (!data.length) {
    return (
      <p className='text-sm text-muted-foreground py-8 text-center'>
        Sem dados ODS disponíveis.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ods: `ODS ${d.ods_id}`,
    count: d.count,
    label: ODS_LABELS[d.ods_id] || `ODS ${d.ods_id}`,
  }));

  return (
    <div className='h-72'>
      <ResponsiveContainer width='100%' height='100%'>
        <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey='ods'
            tick={{ fontSize: 10, fontWeight: 700 }}
          />
          <Radar
            dataKey='count'
            fill='#3b82f6'
            fillOpacity={0.45}
            stroke='#2563eb'
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number, _: string, props: any) => [
              `${value} medida${value !== 1 ? 's' : ''}`,
              props.payload?.label || '',
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
