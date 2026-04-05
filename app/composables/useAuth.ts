import type { Ref } from 'vue'

import { laravelErrorMessage } from '~/utils/laravelApiErrors'

export { extractLaravelErrorMessage } from '~/utils/laravelApiErrors'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'advertiser' | 'admin'
  account_status?: string
  deletion_requested_at?: string | null
  deletion_grace_ends_at?: string | null
  advertiser_profile?: {
    cpf?: string | null
    public_slug?: string | null
    whatsapp?: string | null
    registration_email_verified_at?: string | null
    registration_whatsapp_verified_at?: string | null
  }
  /** null = senha ainda não definida pelo usuário (cadastro com senha interna aleatória). */
  password_set_at?: string | null
}

export interface AccountDeletionStatus {
  approval_status?: string | null
  deletion_requested_at: string | null
  deletion_grace_ends_at: string | null
  can_delete_immediately: boolean
  can_request_scheduled_deletion: boolean
}

export function useAuth() {
  const { request, token } = useApi()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await request<{ token: string; user: AuthUser }>('/v1/login', {
        method: 'POST',
        body: { email: email.trim(), password },
        skipAuth: true,
      })
      token.value = res.token
      user.value = res.user
      return res
    } catch (e: unknown) {
      error.value =
        laravelErrorMessage(e, ['email']) ?? 'Não foi possível entrar. Verifique os dados.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: { name: string; email: string; cpf: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await request<{ token: string; user: AuthUser }>('/v1/register', {
        method: 'POST',
        body: payload,
        skipAuth: true,
      })
      token.value = res.token
      user.value = res.user
      return res
    } catch (e: unknown) {
      error.value = laravelErrorMessage(e, ['email', 'cpf', 'name']) ?? 'Erro ao cadastrar.'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Retoma pré-cadastro em rascunho (mesmo nome, e-mail e CPF) quando a senha ainda não foi definida. */
  async function resumeDraftRegistration(payload: { name: string; email: string; cpf: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await request<{ token: string; user: AuthUser }>('/v1/register/resume', {
        method: 'POST',
        body: payload,
        skipAuth: true,
      })
      token.value = res.token
      user.value = res.user
      return res
    } catch (e: unknown) {
      error.value = laravelErrorMessage(e, ['email', 'cpf', 'name']) ?? 'Não foi possível retomar o cadastro.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      const me = await request<AuthUser>('/v1/me')
      user.value = me
      return me
    } catch (e: unknown) {
      const status = (e as { statusCode?: number; status?: number }).statusCode ?? (e as { status?: number }).status
      if (status === 401) {
        token.value = null
        user.value = null
      }
      return null
    }
  }

  async function fetchDeletionStatus(): Promise<AccountDeletionStatus> {
    return request<AccountDeletionStatus>('/v1/me/account/deletion-status')
  }

  async function deleteAccountImmediate() {
    await request('/v1/me/account', {
      method: 'DELETE',
      body: { confirm: true },
    })
    token.value = null
    user.value = null
  }

  async function requestAccountDeletion() {
    await request('/v1/me/account/deletion-request', {
      method: 'POST',
      body: { confirm: true },
    })
  }

  async function cancelAccountDeletion() {
    await request('/v1/me/account/deletion-request/cancel', {
      method: 'POST',
    })
  }

  async function logout() {
    try {
      await request('/v1/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    token.value = null
    user.value = null
  }

  async function setPassword(password: string, password_confirmation: string) {
    await request('/v1/me/password', {
      method: 'PUT',
      body: { password, password_confirmation },
    })
    await fetchMe()
  }

  /** Remove pré-cadastro em rascunho (público). Libera e-mail e CPF para novo cadastro. */
  async function deleteDraftRegistration(payload: { email: string; cpf: string; confirm: boolean }) {
    try {
      await request<{ message: string }>('/v1/register/draft/delete', {
        method: 'POST',
        body: {
          email: payload.email.trim(),
          cpf: payload.cpf,
          confirm: payload.confirm,
        },
        skipAuth: true,
      })
      token.value = null
      user.value = null
    } catch (e: unknown) {
      throw e
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      return await request<{ message: string }>('/v1/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
        skipAuth: true,
      })
    } catch (e: unknown) {
      error.value =
        laravelErrorMessage(e, ['email']) ?? 'Não foi possível enviar o e-mail. Tente novamente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) {
    loading.value = true
    error.value = null
    try {
      return await request<{ message: string }>('/v1/reset-password', {
        method: 'POST',
        body: {
          token: payload.token,
          email: payload.email.trim(),
          password: payload.password,
          password_confirmation: payload.password_confirmation,
        },
        skipAuth: true,
      })
    } catch (e: unknown) {
      error.value = laravelErrorMessage(e, ['email', 'password']) ?? 'Não foi possível redefinir a senha.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    resumeDraftRegistration,
    fetchMe,
    fetchDeletionStatus,
    deleteAccountImmediate,
    requestAccountDeletion,
    cancelAccountDeletion,
    logout,
    setPassword,
    deleteDraftRegistration,
    forgotPassword,
    resetPassword,
  }
}
