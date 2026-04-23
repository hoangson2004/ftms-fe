import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function UsersPage() {
  return (
    <PageContainer subtitle="Admin-only area for account management." title="Users">
      <AppCard>
        <EmptyState description="Create user list, invite flow, and role management here." />
      </AppCard>
    </PageContainer>
  )
}
