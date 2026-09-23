import type { CustomFetch } from '@govuk-one-login/di-ipv-cri-common-express'
import type { i18n } from 'i18next'
import type { TOptions } from 'i18next'

export {}

interface AppSessionData {
  bankConsentURL?: string
  bankID?: string
  bankName?: string
  consentExpiresAt?: number
  consentID?: string
  flash?: {
    message: {
      content?: string
      header: string
    }
    type: 'error' | 'info' | 'success'
  }[]
  isMobile?: boolean
  webhooksSent?: Record<string, { accountAssessment?: string; consent?: string }>
  wizard: Record<string, { history: string[] }>
}

interface OauthSessionData {
  authParams?: {
    authorization_code?: string
    client_id?: string
    redirect_uri?: string
    state?: string
  }
  tokenId?: string
}

declare module 'express-session' {
  interface SessionData extends AppSessionData, OauthSessionData {}
}

declare global {
  namespace Express {
    interface Locals {
      translate: (key: string, options?: { default?: string } & TOptions) => string
    }
    interface Request {
      customFetch: CustomFetch
      i18n: i18n
    }
  }
}
