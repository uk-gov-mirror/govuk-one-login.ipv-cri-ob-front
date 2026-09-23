import type { Request, Response } from 'express'

import { zodErrorsForView } from '@src/utils/zod-form-errors'
import { z } from 'zod'

import paths from '@src/config/paths'

const renderPage = (_req: Request, res: Response, context: Record<string, unknown> = {}) => {
  res.render('pages/steps/select-sign-in-method', {
    ...context
  })
}

const get = (req: Request, res: Response) => {
  renderPage(req, res)
}

const selectSignInMethodSchema = () =>
  z.object({
    selectSignInMethod: z.enum(
      ['use-different-device', 'stay-on-current-device'],
      'pages.selectSignInMethod.radio.errorMessage'
    )
  })

const post = (req: Request, res: Response) => {
  if (!req.session.consentExpiresAt || Date.now() > req.session.consentExpiresAt!) {
    res.redirect(paths.steps.consent)
    return
  }

  const result = selectSignInMethodSchema().safeParse(req.body)
  if (!result.success) {
    renderPage(req, res, zodErrorsForView(result.error, res.locals.translate))
    return
  }
  if (result.data.selectSignInMethod === 'stay-on-current-device') {
    res.redirect(req.session.bankConsentURL!) // guaranteed by prereq, see routes.ts
  } else {
    res.redirect(paths.steps.scanQuickResponseCode)
  }
}

export { get, post }
