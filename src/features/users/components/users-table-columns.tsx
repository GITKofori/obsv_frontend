'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { UserListItem } from 'types/pmac';
import { UserActionsMenu } from './user-actions-menu';
import { format } from 'date-fns';

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  cimat_admin: 'default',
  tecnico_municipal: 'secondary',
  parceiro_externo: 'outline',
};

const roleLabel: Record<string, string> = {
  cimat_admin: 'Admin CIMAT',
  tecnico_municipal: 'Tecnico Municipal',
  parceiro_externo: 'Parceiro Externo',
};

const estadoBadgeClass: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  convidado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  desativado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const estadoLabel: Record<string, string> = {
  ativo: 'Ativo',
  convidado: 'Convidado',
  desativado: 'Desativado',
};

export function getUserColumns(onRefresh: () => void): ColumnDef<UserListItem>[] {
  return [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => row.original.nome || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Perfil',
      cell: ({ row }) => (
        <Badge variant={roleBadgeVariant[row.original.role] ?? 'outline'}>
          {roleLabel[row.original.role] ?? row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'municipio_nome',
      header: 'Municipio',
      cell: ({ row }) => row.original.municipio_nome || 'Todos',
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${estadoBadgeClass[row.original.estado] ?? ''}`}>
          {estadoLabel[row.original.estado] ?? row.original.estado}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      cell: ({ row }) => format(new Date(row.original.created_at), 'dd/MM/yyyy'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <UserActionsMenu user={row.original} onRefresh={onRefresh} />,
    },
  ];
}
