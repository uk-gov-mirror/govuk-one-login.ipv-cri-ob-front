import { ConsentRequest, ConsentResponse } from '@src/models/consent.class'
import { describe, expect, it } from 'vitest'

describe('ConsentRequest', () => {
  it('maps constructor args to toData() snake_case output', () => {
    const data = new ConsentRequest('session-id', 'bank-id').toData()

    expect(data).toEqual({ bank_id: 'bank-id', session_id: 'session-id' })
  })
})

describe('ConsentResponse', () => {
  describe('fromData', () => {
    it('maps snake_case data to camelCase properties', () => {
      const response = ConsentResponse.fromData({
        bank_consent_url: 'https://bank.example/consent',
        bank_id: 'test-bank-1',
        id: 'test-consent-id',
        redirect_url: 'https://redirect.example/return',
        url_expiry_seconds: 300
      })

      expect(response.bankID).toBe('test-bank-1')
      expect(response.consentID).toBe('test-consent-id')
      expect(response.bankConsentURL).toEqual(new URL('https://bank.example/consent'))
      expect(response.redirectURL).toEqual(new URL('https://redirect.example/return'))
      expect(response.urlExpirySeconds).toEqual(300)
    })
  })
})
