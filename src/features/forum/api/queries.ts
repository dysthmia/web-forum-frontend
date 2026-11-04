import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys.ts'
import { forumApi, type CategoryTopicOptions, type ListOptions } from './forumApi.ts'

export function useCategoriesQuery() { return useQuery({ queryKey: queryKeys.categories, queryFn: () => forumApi.getCategories() }) }
export function useCategoryQuery(slug: string) { return useQuery({ queryKey: ['categories', slug], queryFn: () => forumApi.getCategory(slug), enabled: Boolean(slug) }) }
export function useCategoryTopicsQuery(categoryId: number | undefined, options: CategoryTopicOptions) { return useQuery({ queryKey: ['topics', 'category', categoryId, options], queryFn: () => forumApi.getCategoryTopics(categoryId as number, options), enabled: categoryId !== undefined }) }
export function useTopicQuery(topicId: number | undefined, options: ListOptions) { return useQuery({ queryKey: ['topics', 'detail', topicId, options], queryFn: () => forumApi.getTopic(topicId as number, options), enabled: topicId !== undefined }) }
export function useSearchQuery(query: string, options: ListOptions) { return useQuery({ queryKey: ['search', query, options], queryFn: () => forumApi.search(query, options), enabled: query.length > 0 }) }
export function usePublicUserProfileQuery(userId: number | undefined) { return useQuery({ queryKey: ['users', 'detail', userId], queryFn: () => forumApi.getPublicUserProfile(userId as number), enabled: userId !== undefined }) }
