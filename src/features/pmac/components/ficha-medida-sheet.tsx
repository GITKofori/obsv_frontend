'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Medida } from 'types/pmac';

interface FichaMedidaSheetProps {
  medida: Medida | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SETOR_COLORS: Record<string, string> = {
  Energia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Transportes:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Agroflorestal:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Resíduos:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Água: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Saúde: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'Proteção Civil':
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const TIPO_RESPOSTA_COLORS: Record<string, string> = {
  Mitigação: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Adaptação: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Transversal:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const ODS_COLORS: Record<number, string> = {
  1:  'bg-red-600',
  2:  'bg-amber-500',
  3:  'bg-green-600',
  4:  'bg-red-800',
  5:  'bg-orange-600',
  6:  'bg-sky-500',
  7:  'bg-yellow-500',
  8:  'bg-rose-900',
  9:  'bg-orange-500',
  10: 'bg-pink-600',
  11: 'bg-amber-600',
  12: 'bg-amber-800',
  13: 'bg-emerald-700',
  14: 'bg-blue-500',
  15: 'bg-lime-600',
  16: 'bg-blue-800',
  17: 'bg-blue-950',
};

const ODS_LABELS: Record<number, string> = {
  1:  'Erradicar a Pobreza',
  2:  'Erradicar a Fome',
  3:  'Saúde de Qualidade',
  4:  'Educação de Qualidade',
  5:  'Igualdade de Género',
  6:  'Água Potável e Saneamento',
  7:  'Energias Renováveis e Acessíveis',
  8:  'Trabalho Digno e Crescimento Económico',
  9:  'Indústria, Inovação e Infraestrutura',
  10: 'Reduzir as Desigualdades',
  11: 'Cidades e Comunidades Sustentáveis',
  12: 'Produção e Consumo Sustentáveis',
  13: 'Ação Climática',
  14: 'Proteger a Vida Marinha',
  15: 'Proteger a Vida Terrestre',
  16: 'Paz, Justiça e Instituições Eficazes',
  17: 'Parcerias para a Implementação dos Objetivos',
};

function getOdsColor(id: number) {
  return ODS_COLORS[id] || 'bg-slate-500';
}

function getOdsLabel(id: number) {
  return ODS_LABELS[id] || `ODS ${id}`;
}

export function FichaMedidaSheet({
  medida,
  open,
  onOpenChange,
}: FichaMedidaSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[420px] sm:w-[480px] overflow-y-auto'>
        {medida && (
          <>
            <SheetHeader className='mb-4'>
              <div className='flex items-center gap-2 mb-1'>
                <code className='font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded'>
                  {medida.id}
                </code>
              </div>
              <SheetTitle className='text-base leading-snug text-left'>
                {medida.designacao}
              </SheetTitle>
            </SheetHeader>

            <div className='space-y-5'>
              {/* Setor */}
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide'>
                  Setor
                </p>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-[11px] font-semibold',
                    SETOR_COLORS[medida.setor]
                  )}
                >
                  {medida.setor}
                </Badge>
              </div>

              <Separator />

              {/* Tipo de Resposta */}
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide'>
                  Tipo de Resposta
                </p>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-[11px] font-semibold',
                    TIPO_RESPOSTA_COLORS[medida.tipo_resposta]
                  )}
                >
                  {medida.tipo_resposta}
                </Badge>
              </div>

              <Separator />

              {/* Descrição */}
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide'>
                  Descrição
                </p>
                {medida.descricao ? (
                  <p className='text-sm leading-relaxed'>{medida.descricao}</p>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>
                    Sem descrição disponível.
                  </p>
                )}
              </div>

              <Separator />

              {/* Objetivos */}
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide'>
                  Objetivos
                </p>
                {medida.objetivos ? (
                  <p className='text-sm leading-relaxed'>{medida.objetivos}</p>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>
                    Sem objetivos definidos.
                  </p>
                )}
              </div>

              {/* ODS */}
              {medida.ods_associados && medida.ods_associados.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide'>
                      ODS Associados
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {medida.ods_associados.map((odsId) => (
                        <div
                          key={odsId}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-white',
                            getOdsColor(odsId)
                          )}
                          title={getOdsLabel(odsId)}
                        >
                          <span className='font-bold text-sm'>{odsId}</span>
                          <span className='text-xs opacity-90'>
                            {getOdsLabel(odsId)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
