import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function MatchmakingPage() {
  return (
    <PageContainer subtitle="Opponent matching and fixture proposal workflows." title="Matchmaking">
      <AppCard>
        <EmptyState description="Add search, proposal, and approval tools for arranging matches here." />
      </AppCard>
    </PageContainer>
  )
}
