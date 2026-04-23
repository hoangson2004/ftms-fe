import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function NotificationsPage() {
  return (
    <PageContainer subtitle="Announcements, reminders, and message logs." title="Notifications">
      <AppCard>
        <EmptyState description="Build notification templates, recipients, and delivery history here." />
      </AppCard>
    </PageContainer>
  )
}
