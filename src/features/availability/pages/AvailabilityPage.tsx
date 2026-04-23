import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function AvailabilityPage() {
  return (
    <PageContainer subtitle="Availability tracking for training and matchdays." title="Availability">
      <AppCard>
        <EmptyState description="Place training schedules, availability matrix, and attendance tools here." />
      </AppCard>
    </PageContainer>
  )
}
