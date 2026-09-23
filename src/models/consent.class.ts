export interface ConsentRequestData {
  // TODO: incomplete
  bank_id: string
  session_id: string
}

export interface ConsentResponseData {
  // TODO: incomplete
  bank_consent_url: string
  bank_id: string
  id: string
  redirect_url: string
  url_expiry_seconds: number
}

export class ConsentRequest {
  // TODO: incomplete
  bankID: string
  sessionID: string

  constructor(sessionID: string, bankID: string) {
    this.sessionID = sessionID
    this.bankID = bankID
  }

  toData() {
    return {
      bank_id: this.bankID,
      session_id: this.sessionID
    } satisfies ConsentRequestData
  }
}

export class ConsentResponse {
  // TODO: incomplete
  bankConsentURL: URL // where to send the user after consent has been granted on the CRI
  bankID: string
  consentID: string
  redirectURL: URL // where to send the user back to after they have completed the online banking journey
  urlExpirySeconds: number

  constructor(
    bank_consent_url: string,
    bank_id: string,
    consent_id: string,
    redirect_url: string,
    url_expiry_seconds: number
  ) {
    this.bankConsentURL = new URL(bank_consent_url)
    this.bankID = bank_id
    this.consentID = consent_id
    this.redirectURL = new URL(redirect_url)
    this.urlExpirySeconds = url_expiry_seconds
  }

  static fromData(data: ConsentResponseData) {
    return new ConsentResponse(
      data.bank_consent_url,
      data.bank_id,
      data.id,
      data.redirect_url,
      data.url_expiry_seconds
    )
  }
}
