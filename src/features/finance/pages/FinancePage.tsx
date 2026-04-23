import { PageContainer } from '@/common/components/layout/PageContainer'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { AppCard } from '@/common/components/ui/AppCard'

export function FinancePage() {
  return (
    <PageContainer subtitle="Budgeting, fees, and payment tracking." title="Finance">
      <AppCard>
        <EmptyState description="Implement invoices, income/expense flows, and ledger widgets here." />
      </AppCard>
    </PageContainer>
  )
}
