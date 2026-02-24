import { Product } from '@/constants/data';
import { fakeProducts } from '@/constants/mock-api';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import axios from 'axios';
import { api } from '@/lib/axios';

type ProductListingPage = {};

// Define the actual API response structure
interface ApiProductsResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

// Define the function return type
interface FetchProductsResponse {
  data: ApiProductsResponse | null;
  error: string | null;
}

interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
}

async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<FetchProductsResponse> {
  try {
    console.log(params);

    // Build query string properly to handle undefined values
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.categories) queryParams.set('categories', params.categories);

    const response = await api.get<ApiProductsResponse>(
      `/protected/metrics?${queryParams.toString()}`
    );

    // Return the response.data directly since it matches ApiProductsResponse
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load data'
    };
  }
}

export default async function ProductListingPage({}: ProductListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');
  const categories = searchParamsCache.get('categories');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const result = await fetchProducts(filters);

  // Handle the error case
  if (result.error || !result.data) {
    return <div>Error loading products: {result.error}</div>;
  }

  const totalProducts = result.data.total;
  const products: Product[] = result.data.data;

  return (
    <ProductTable
      columns={columns}
      data={products}
      totalItems={totalProducts}
    />
  );
}
