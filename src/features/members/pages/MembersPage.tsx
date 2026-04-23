import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function MembersPage() {
  return (
    <PageContainer subtitle="Player/member registration and profile data." title="Members">
      <AppCard>
        <EmptyState description="Add member table, profile pages, and onboarding workflows here." />
      </AppCard>
    </PageContainer>
  )
}
