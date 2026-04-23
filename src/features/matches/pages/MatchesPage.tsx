import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function MatchesPage() {
  return (
    <PageContainer subtitle="Fixtures, match reports, and result management." title="Matches">
      <AppCard>
        <EmptyState description="Add fixtures board, result entry, and match report modules here." />
      </AppCard>
    </PageContainer>
  )
}
