import { useQuery, type QueryClient } from '@tanstack/react-query'
import { forumApi, type CategoryTopicOptions, type ListOptions, type ReactionCounts } from './forumApi.ts'

export function useTopicsQuery(options: CategoryTopicOptions) { return useQuery({ queryKey: ['topics', 'feed', options], queryFn: () => forumApi.getTopics(options) }) }
export function useCategoryTopicsQuery(categoryId: number | undefined, options: CategoryTopicOptions) { return useQuery({ queryKey: ['topics', 'category', categoryId, options], queryFn: () => forumApi.getCategoryTopics(categoryId as number, options), enabled: categoryId !== undefined }) }
export function useTopicQuery(topicId: number | undefined, options: ListOptions) { return useQuery({ queryKey: ['topics', 'detail', topicId, options], queryFn: () => forumApi.getTopic(topicId as number, options), enabled: topicId !== undefined }) }
export function useReactionCountsQuery(postIds: number[], viewerId: number | null) { return useQuery<ReactionCounts[]>({ queryKey: ['reactions', 'counts', viewerId ?? 'guest', postIds], queryFn: () => forumApi.getReactionCounts(postIds), enabled: postIds.length > 0 }) }
export function useSearchQuery(query: string, options: ListOptions) { return useQuery({ queryKey: ['search', query, options], queryFn: () => forumApi.search(query, options), enabled: query.length > 0 }) }
export function usePublicUserProfileQuery(userId: number | undefined) { return useQuery({ queryKey: ['users', 'detail', userId], queryFn: () => forumApi.getPublicUserProfile(userId as number), enabled: userId !== undefined }) }
export function usePublicUserProfileByUsernameQuery(username: string) { return useQuery({ queryKey: ['users', 'username', username], queryFn: () => forumApi.getPublicUserProfileByUsername(username), enabled: Boolean(username) }) }
export async function invalidateTopicRelatedQueries(queryClient: QueryClient): Promise<void> { await Promise.all([queryClient.invalidateQueries({ queryKey: ['topics'] }), queryClient.invalidateQueries({ queryKey: ['search'] }), queryClient.invalidateQueries({ queryKey: ['bookmarks'] }), queryClient.invalidateQueries({ queryKey: ['reactions'] })]) }
