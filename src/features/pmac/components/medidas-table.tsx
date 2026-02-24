'use client';

import { useState } from 'react';
import { ChevronRight, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Medida, Indicador, UserRole } from 'types/pmac';
import { IndicadorRow } from './indicador-row';
import { FichaMedidaSheet } from './ficha-medida-sheet';
import { IndicadorFormDialog } from './indicador-form-dialog';

interface MedidasTableProps {
  medidas: (Medida & { indicadores: Indicador[] })[];
  userRole: UserRole | null;
  onEdit: (medida: Medida) => void;
  onDelete: (medida: Medida) => void;
  onRefresh: () => void;
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

const STATUS_COLORS: Record<string, string> = {
  Concluído:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Em Curso':
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Pendente:
    'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

function getStatus(indicadores: Indicador[]): string {
  if (!indicadores.length) return 'Pendente';

  const allConcluido = indicadores.every(
    (ind) =>
      ind.meta_alvo != null &&
      ind.valor_acumulado != null &&
      ind.valor_acumulado >= ind.meta_alvo
  );
  if (allConcluido) return 'Concluído';

  const anyProgress = indicadores.some(
    (ind) => ind.valor_acumulado != null && ind.valor_acumulado > 0
  );
  if (anyProgress) return 'Em Curso';

  return 'Pendente';
}

export function MedidasTable({ medidas, userRole, onEdit, onDelete, onRefresh }: MedidasTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedFicha, setSelectedFicha] = useState<Medida | null>(null);
  const [indicadorMedida, setIndicadorMedida] = useState<(Medida & { indicadores: Indicador[] }) | null>(null);

  function canManage(medida: Medida): boolean {
    if (!userRole) return false;
    if (userRole.role === 'cimat_admin') return true;
    if (userRole.role === 'tecnico_municipal') {
      return medida.fk_municipio === userRole.fk_municipio;
    }
    return false;
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (!medidas.length) {
    return (
      <p className='text-sm text-muted-foreground py-8 text-center'>
        Nenhuma medida encontrada.
      </p>
    );
  }

  return (
    <>
      <div className='w-full overflow-x-auto'>
        <table className='w-full caption-bottom text-sm'>
          <thead className='[&_tr]:border-b'>
            <tr className='border-b transition-colors hover:bg-muted/50'>
              <th className='h-10 w-10 px-2' />
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Código
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Designação
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Setor
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Estado
              </th>
              <th className='h-10 px-4 text-left align-middle font-medium text-muted-foreground'>
                Ficha
              </th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            {medidas.map((medida) => {
              const isExpanded = expandedIds.has(medida.id);
              const status = getStatus(medida.indicadores);

              return (
                <MedidaRow
                  key={medida.id}
                  medida={medida}
                  status={status}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(medida.id)}
                  onOpenFicha={(m) => setSelectedFicha(m)}
                  canManage={canManage(medida)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddIndicador={(m) => setIndicadorMedida(m)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <FichaMedidaSheet
        medida={selectedFicha}
        open={!!selectedFicha}
        onOpenChange={(open) => { if (!open) setSelectedFicha(null); }}
      />

      {indicadorMedida && (
        <IndicadorFormDialog
          medidaId={indicadorMedida.id}
          medidaDesignacao={indicadorMedida.designacao}
          open={!!indicadorMedida}
          onOpenChange={(open) => { if (!open) setIndicadorMedida(null); }}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

function MedidaRow({
  medida,
  status,
  isExpanded,
  onToggle,
  onOpenFicha,
  canManage,
  onEdit,
  onDelete,
  onAddIndicador,
}: {
  medida: Medida & { indicadores: Indicador[] };
  status: string;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenFicha: (medida: Medida) => void;
  canManage: boolean;
  onEdit: (medida: Medida) => void;
  onDelete: (medida: Medida) => void;
  onAddIndicador: (medida: Medida & { indicadores: Indicador[] }) => void;
}) {
  return (
    <>
      <tr
        className='border-b transition-colors hover:bg-muted/50 cursor-pointer'
        onClick={onToggle}
      >
        <td className='px-2 py-3 align-middle'>
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
        </td>
        <td className='px-4 py-3 align-middle'>
          <code className='font-mono text-xs font-semibold text-blue-600 dark:text-blue-400'>
            {medida.id}
          </code>
        </td>
        <td className='px-4 py-3 align-middle font-medium'>
          {medida.designacao}
        </td>
        <td className='px-4 py-3 align-middle'>
          <Badge
            variant='secondary'
            className={cn(
              'text-[10px] font-semibold',
              SETOR_COLORS[medida.setor]
            )}
          >
            {medida.setor}
          </Badge>
        </td>
        <td className='px-4 py-3 align-middle'>
          <Badge
            variant='secondary'
            className={cn(
              'text-[10px] font-semibold',
              STATUS_COLORS[status]
            )}
          >
            {status}
          </Badge>
        </td>
        <td className='px-4 py-3 align-middle'>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onOpenFicha(medida);
              }}
              className='flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
              aria-label='Ver ficha da medida'
            >
              <FileText className='h-4 w-4' />
            </button>
            {canManage && (
              <>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(medida);
                  }}
                  className='flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                  aria-label='Editar medida'
                >
                  <Pencil className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(medida);
                  }}
                  className='flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors'
                  aria-label='Eliminar medida'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={6} className='bg-muted/30 px-4 py-3'>
            <div className='space-y-3 pl-6'>
              {medida.indicadores.length === 0 ? (
                <p className='text-sm text-muted-foreground italic'>
                  Nenhum indicador associado a esta medida.
                </p>
              ) : (
                medida.indicadores.map((ind) => (
                  <IndicadorRow key={ind.id} indicador={ind} />
                ))
              )}
              {canManage && (
                <Button
                  size='sm'
                  variant='outline'
                  className='mt-1'
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddIndicador(medida);
                  }}
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' />
                  Adicionar Indicador
                </Button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
