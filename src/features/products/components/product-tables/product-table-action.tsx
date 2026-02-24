'use client';

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useProductTableFilters } from './use-product-table-filters';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { createBrowserSupabase } from '@/utils/supabase/client';
interface CategoryOptions {
  value: string;
  label: string;
}
async function fetchCategoryOptions(): Promise<{
  data: CategoryOptions[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createBrowserSupabase();
    const backendApiUrl = 'https://obsv.lusitan.io/api/protected/types';
    const response = await axios.get(backendApiUrl, {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load data'
    };
  }
}

export default function ProductTableAction() {
  const {
    categoriesFilter,
    setCategoriesFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useProductTableFilters();

  const [CATEGORY_OPTIONS, setOptions] = useState<CategoryOptions[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCategoryOptions();
      if (result.data) setOptions(result?.data);
    };
    fetchData();
  }, []);

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='name'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey='categories'
        title='Tipos'
        options={CATEGORY_OPTIONS}
        setFilterValue={setCategoriesFilter}
        filterValue={categoriesFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
