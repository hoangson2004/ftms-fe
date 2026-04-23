import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function TeamsPage() {
  return (
    <PageContainer subtitle="Team roster, formations, and staff ownership." title="Teams">
      <AppCard>
        <EmptyState description="Build teams list, create form, and team detail modules here." />
      </AppCard>
    </PageContainer>
  )
}
