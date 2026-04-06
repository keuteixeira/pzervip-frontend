/**
 * Stubs para imports legados após remoção dos mocks.
 * Nada disto é usado em runtime (`isMock` é sempre false em `useAdminMock`).
 */

export const ADMIN_MOCK_MEDIA_PENDING: unknown[] = []

export function filterMockHighlightOrders(_paymentStatus: string): unknown[] {
  return []
}

export function filterMockComments(_status: string): unknown[] {
  return []
}
