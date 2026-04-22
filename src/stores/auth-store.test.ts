import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  id: 'uuid-1',
  email: 'user@example.com',
  name: 'Test User',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts with empty tokens when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.refreshToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('persists tokens so a new store instance reads it back', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setTokens('session-token', 'refresh-token')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe(
      'session-token'
    )
    expect(useAuthStoreAfterReload.getState().auth.refreshToken).toBe(
      'refresh-token'
    )
  })

  it('updates the signed-in user via setUser', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user and tokens and drops persistence', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setTokens('will-be-cleared', 'also-cleared')
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.refreshToken).toBe('')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull()
    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
    expect(useAuthStoreAfterReload.getState().auth.refreshToken).toBe('')
  })
})
