'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { getUserColumns } from './users-table-columns';
import type { UserListItem } from 'types/pmac';

interface UsersTableProps {
  data: UserListItem[];
  total: number;
  onRefresh: () => void;
}

export function UsersTable({ data, total, onRefresh }: UsersTableProps) {
  const columns = getUserColumns(onRefresh);
  return <DataTable columns={columns} data={data} totalItems={total} />;
}
