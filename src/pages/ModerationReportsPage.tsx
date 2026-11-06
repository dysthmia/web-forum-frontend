import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { PendingReport, ReviewReportStatus } from '../features/moderation/api/moderationApi.ts'
import { moderationApi } from '../features/moderation/api/moderationApi.ts'
import { ApiError } from '../shared/api/errors.ts'
import { formatDate } from '../shared/lib/formatDate.ts'
import { Button } from '../shared/ui/Button.tsx'
import { Checkbox } from '../shared/ui/Checkbox.tsx'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog.tsx'
import { Container } from '../shared/ui/Container.tsx'
import { EmptyState } from '../shared/ui/EmptyState.tsx'
import { ErrorState } from '../shared/ui/ErrorState.tsx'
import { LoadingState } from '../shared/ui/LoadingState.tsx'
import { PageTitle } from '../shared/ui/PageTitle.tsx'

interface PendingReview {
  report: PendingReport
  status: ReviewReportStatus
  hidePost: boolean
}

function reviewError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось обработать жалобу. Попробуйте ещё раз.'
  const title = error.problemTitle?.toLowerCase() ?? ''
  if (error.status === 409 && title.includes('first post')) return 'Нельзя скрыть первое сообщение темы: скройте тему целиком.'
  if (error.status === 409) return 'Жалоба уже была обработана другим решением.'
  if (error.status === 400) return 'Сервер не принял решение по жалобе.'
  if (error.status === 403) return 'У вас нет прав для обработки этой жалобы.'
  if (error.status === 404) return 'Жалоба или пользователь, принявший решение, больше не найдены.'
  return error.problemTitle ?? error.message
}

export function ModerationReportsPage() {
  const queryClient = useQueryClient()
  const [hidePostByReport, setHidePostByReport] = useState<Record<number, boolean>>({})
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null)
  const reportsQuery = useQuery({ queryKey: ['moderation', 'reports'], queryFn: () => moderationApi.reports() })
  const reviewMutation = useMutation({
    mutationFn: ({ reportId, status, hidePost }: { reportId: number; status: ReviewReportStatus; hidePost: boolean }) => moderationApi.reviewReport(reportId, status, hidePost),
    onSuccess: async () => {
      setPendingReview(null)
      await queryClient.invalidateQueries({ queryKey: ['moderation', 'reports'] })
    },
  })
  const mutationError = reviewMutation.isError ? reviewError(reviewMutation.error) : null

  const selectReview = (report: PendingReport, status: ReviewReportStatus) => {
    reviewMutation.reset()
    setPendingReview({ report, status, hidePost: status === 'accepted' && Boolean(hidePostByReport[report.reportId]) })
  }

  const reports = reportsQuery.data
  return <section className="py-8"><Container><PageTitle title="Жалобы" description="Очередь сообщений, ожидающих решения модерации." />{mutationError ? <p className="mt-4 text-sm text-forum-text" role="alert">{mutationError}</p> : null}<div className="mt-5">{reportsQuery.isPending ? <LoadingState label="Загрузка жалоб…" /> : reportsQuery.isError ? <ErrorState message={reviewError(reportsQuery.error)} onRetry={() => void reportsQuery.refetch()} /> : reports?.length ? <div className="border-t border-forum-border">{reports.map((report) => <article key={report.reportId} className="border-b border-forum-border py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-medium text-forum-text">Жалоба #{report.reportId}</h2><p className="mt-1 text-sm text-forum-muted">Сообщение #{report.postId} · от {report.reporterUsername} · пользователь #{report.reporterId}</p><p className="mt-3 text-sm text-forum-text">{report.reason}</p><p className="mt-2 text-xs text-forum-muted">{formatDate(report.createdAt)}</p></div><div className="grid min-w-52 gap-2"><Checkbox label="Скрыть сообщение" checked={Boolean(hidePostByReport[report.reportId])} disabled={reviewMutation.isPending} onChange={(event) => setHidePostByReport((current) => ({ ...current, [report.reportId]: event.target.checked }))} /><div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={reviewMutation.isPending} aria-label={`Принять жалобу #${report.reportId}`} onClick={() => selectReview(report, 'accepted')}>Принять</Button><Button variant="ghost" disabled={reviewMutation.isPending} aria-label={`Отклонить жалобу #${report.reportId}`} onClick={() => selectReview(report, 'rejected')}>Отклонить</Button></div></div></div></article>)}</div> : <EmptyState title="Нет pending-жалоб" description="Новые жалобы появятся здесь." />}</div><ConfirmDialog open={pendingReview !== null} title={pendingReview?.status === 'accepted' ? 'Принять жалобу?' : 'Отклонить жалобу?'} description={pendingReview ? pendingReview.status === 'accepted' ? `Жалоба #${pendingReview.report.reportId} будет принята${pendingReview.hidePost ? ', а сообщение будет скрыто' : ''}.` : `Жалоба #${pendingReview.report.reportId} будет отклонена.` : ''} confirmLabel="Подтвердить решение" loading={reviewMutation.isPending} onClose={() => { if (!reviewMutation.isPending) setPendingReview(null) }} onConfirm={() => { if (pendingReview) reviewMutation.mutate({ reportId: pendingReview.report.reportId, status: pendingReview.status, hidePost: pendingReview.status === 'accepted' ? pendingReview.hidePost : false }) }} /></Container></section>
}
