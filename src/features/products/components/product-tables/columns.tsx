'use client';
import { Product } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'type',
    header: 'TYPE',
    cell: ({ row }) => {
      return row.getValue('type');
    }
  },
  {
    accessorKey: 'sub_type',
    header: 'SUBTYPE'
  },
  {
    accessorKey: 'consumer_type',
    header: 'CONSUMER_TYPE'
  },
  {
    accessorKey: 'value',
    header: 'VALUE'
  },
  {
    accessorKey: 'year',
    header: 'YEAR'
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
