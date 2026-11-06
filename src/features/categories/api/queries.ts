import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys.ts'
import { categoriesApi } from './categoriesApi.ts'

export function useCategoriesQuery() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: () => categoriesApi.getList() })
}

export function useCategoryQuery(slug: string) {
  return useQuery({ queryKey: ['categories', slug], queryFn: () => categoriesApi.getBySlug(slug), enabled: Boolean(slug) })
}
