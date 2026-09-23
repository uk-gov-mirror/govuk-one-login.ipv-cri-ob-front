import type { NextFunction, Request, Response } from 'express'

import { consentsClient } from '@src/clients/consents.client'
import { ConsentRequest } from '@src/models/consent.class'
import { zodErrorsForView } from '@src/utils/zod-form-errors'
import { z } from 'zod'

import paths from '@src/config/paths'

const renderPage = (req: Request, res: Response, context: Record<string, unknown> = {}) => {
  res.locals['selectedBankName'] = req.session.bankName
  res.locals['isMobile'] = req.session.isMobile
  res.render('pages/steps/consent', {
    ...context,
    proveAnotherWay: paths.steps.proveAnotherWay
  })
}

const get = (req: Request, res: Response, _next: NextFunction) => {
  renderPage(req, res)
}

const consentSchema = () =>
  z.object({
    consent: z.literal('consent', 'pages.consent.checkbox.errorMessage')
  })

const post = async (req: Request, res: Response) => {
  const result = consentSchema().safeParse(req.body)
  if (!result.success) {
    renderPage(req, res, zodErrorsForView(result.error, res.locals.translate))
    return
  }
  const bankID = req.session.bankID!
  const consentResponse = await consentsClient(req).createConsent(
    new ConsentRequest(req.sessionID, bankID).toData()
  )
  req.session.consentID = consentResponse.consentID
  req.session.bankConsentURL = consentResponse.bankConsentURL.toString()
  req.session.consentExpiresAt = Date.now() + consentResponse.urlExpirySeconds * 1000

  if (req.session.isMobile) {
    res.redirect(req.session.bankConsentURL)
    return
  }
  res.redirect(paths.steps.selectSignInMethod)
}

export { get, post }
