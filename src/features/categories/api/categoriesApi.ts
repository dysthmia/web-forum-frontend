import type { Category } from '../../../entities/category/model/types.ts'
import { httpClient } from '../../../shared/api/httpClient.ts'

export interface CategoryInput {
  name: string
  slug: string
  description: string | null
}

export const categoriesApi = {
  async getList(): Promise<Category[]> {
    const { data } = await httpClient.get<Category[]>('/api/categories')
    return data
  },
  async getBySlug(slug: string): Promise<Category> {
    const { data } = await httpClient.get<Category>(`/api/categories/${encodeURIComponent(slug)}`)
    return data
  },
  async create(input: CategoryInput): Promise<Category> {
    const { data } = await httpClient.post<Category>('/api/categories', input)
    return data
  },
  async update(categoryId: number, input: CategoryInput): Promise<Category> {
    const { data } = await httpClient.put<Category>(`/api/categories/${categoryId}`, input)
    return data
  },
  async remove(categoryId: number): Promise<void> {
    await httpClient.delete(`/api/categories/${categoryId}`)
  },
}
