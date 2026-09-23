import type { Request, Response } from 'express'
import type { SessionData } from 'express-session'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import paths from '@src/config/paths'

const BANK_CONSENT_URL = 'https://bank.example/consent/abc'
const URL_EXPIRES_AT = Date.now() + 60_000
const URL_EXPIRED_AT = Date.now() - 60_000

const mockRender = vi.fn()

const buildReq = (body: { selectSignInMethod: string }, consentExpiresAt: number): Request =>
  ({
    body,
    session: { bankConsentURL: BANK_CONSENT_URL, consentExpiresAt } satisfies Partial<SessionData>
  }) as Request

const buildRes = (): Response =>
  ({
    locals: { translate: (key: string) => key },
    render: mockRender
  }) as unknown as Response

const { get, post } = await import('@src/controllers/steps/select-sign-in-method.controller')

describe('select-sign-in-method controller', () => {
  beforeEach(() => {
    mockRender.mockReset()
  })

  describe('get', () => {
    it('renders the page ', () => {
      const render = vi.fn()

      get({} as Request, { render } as unknown as Response)

      expect(render).toHaveBeenCalledWith('pages/steps/select-sign-in-method', expect.anything())
    })
  })

  describe('post', () => {
    it('redirects appropriately when "use-different-device" is selected', () => {
      const redirect = vi.fn()
      const req = buildReq({ selectSignInMethod: 'use-different-device' }, URL_EXPIRES_AT)

      post(req, { redirect } as unknown as Response)

      expect(redirect).toHaveBeenCalledWith(paths.steps.scanQuickResponseCode)
    })

    it('redirects appropriately when "stay-on-current-device" is selected', () => {
      const redirect = vi.fn()
      const req = buildReq({ selectSignInMethod: 'stay-on-current-device' }, URL_EXPIRES_AT)
      post(req, { redirect } as unknown as Response)

      expect(redirect).toHaveBeenCalledWith(BANK_CONSENT_URL)
    })

    it('redirects to consent when consentExpiresAt is missing', () => {
      const redirect = vi.fn()
      const req = {
        body: { selectSignInMethod: 'stay-on-current-device' },
        session: { bankConsentURL: BANK_CONSENT_URL } satisfies Partial<SessionData>
      } as Request

      post(req, { redirect } as unknown as Response)

      expect(redirect).toHaveBeenCalledWith(paths.steps.consent)
    })

    it('redirects to consent when consentExpiresAt is in the past', () => {
      const redirect = vi.fn()
      post(buildReq({ selectSignInMethod: 'stay-on-current-device' }, URL_EXPIRED_AT), {
        redirect
      } as unknown as Response)
      expect(redirect).toHaveBeenCalledWith(paths.steps.consent)
    })

    it('re-renders with errors when no option is selected', () => {
      const req = buildReq({ selectSignInMethod: '' }, URL_EXPIRES_AT)
      const res = buildRes()

      post(req, res)

      expect(mockRender).toHaveBeenCalledWith(
        'pages/steps/select-sign-in-method',
        expect.objectContaining({
          errorList: [
            { href: '#select-sign-in-method', text: 'pages.selectSignInMethod.radio.errorMessage' }
          ],
          formErrors: { selectSignInMethod: 'pages.selectSignInMethod.radio.errorMessage' }
        })
      )
    })

    it('re-renders with errors when a tampered value is submitted', () => {
      const req = buildReq({ selectSignInMethod: 'tampered-radio-value' }, URL_EXPIRES_AT)
      const res = buildRes()

      post(req, res)

      expect(mockRender).toHaveBeenCalledWith(
        'pages/steps/select-sign-in-method',
        expect.objectContaining({
          errorList: [
            { href: '#select-sign-in-method', text: 'pages.selectSignInMethod.radio.errorMessage' }
          ],
          formErrors: { selectSignInMethod: 'pages.selectSignInMethod.radio.errorMessage' }
        })
      )
    })
  })
})
