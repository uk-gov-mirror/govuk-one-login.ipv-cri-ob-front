import type { Router } from 'express'
import type { SessionData } from 'express-session'

import { failureSteps, steps, stubs } from '@src/controllers'
import { detectDevice } from '@src/middleware'
import { asyncControllerHandler } from '@src/utils/async-controller-handler'
import { walkWizard } from '@src/utils/dev-tooling/wizard-diagram'
import { alarmBadge, LOGGER } from '@src/utils/logger'
import { createWizard } from '@src/utils/wizard'

import commonExpress from '@govuk-one-login/di-ipv-cri-common-express'
import appConfig from '@src/config/app'
import paths from '@src/config/paths'

const openBankingJourney = createWizard<SessionData>(
  'ob-journey',
  {
    [paths.steps.start]: {
      entryPoint: true,
      reset: true,
      next: [paths.steps.chooseBank, paths.steps.proveAnotherWay],
      controller: steps.startController
    },
    [paths.steps.chooseBank]: {
      next: [paths.steps.consent, paths.failureSteps.bankProblem, paths.steps.proveAnotherWay],
      controller: steps.chooseBankController
    },
    [paths.steps.consent]: {
      next: [
        paths.steps.selectSignInMethod,
        paths.failureSteps.bankProblem,
        paths.steps.proveAnotherWay
      ],
      prereq: { keys: ['bankID'], redirectTo: paths.steps.chooseBank },
      middleware: [detectDevice.middleware],
      exit: true, // step can redirect the user straight to the bank consent url if they are on a mobile device
      controller: steps.consentController
    },
    [paths.steps.selectSignInMethod]: {
      next: [paths.steps.scanQuickResponseCode, paths.steps.consent],
      prereq: { keys: ['consentID', 'bankConsentURL'], redirectTo: paths.steps.consent },
      exit: true,
      controller: steps.selectSignInMethodController
    },
    [paths.steps.scanQuickResponseCode]: {
      next: [paths.steps.scannedQuickResponseCodeHolding],
      noReturn: true
    },
    [paths.steps.scannedQuickResponseCodeHolding]: {
      next: [paths.steps.checkDetailsHolding, paths.failureSteps.useACurrentAccount],
      noReturn: true
    },
    [paths.steps.checkDetailsHolding]: {
      next: [paths.failureSteps.couldNotConfirmIdentity],
      entryPoint: true,
      noReturn: true,
      controller: steps.checkDetailsController
    },
    [paths.failureSteps.bankProblem]: {
      next: [paths.steps.chooseBank, paths.steps.proveAnotherWay],
      controller: failureSteps.bankProblemController,
      reset: true,
      noReturn: true
    },
    [paths.failureSteps.useACurrentAccount]: {
      next: [paths.steps.chooseBank, paths.steps.consent],
      noReturn: true
    },
    [paths.failureSteps.couldNotConfirmIdentity]: {
      next: [paths.steps.chooseBank],
      noReturn: true
    },
    [paths.steps.proveAnotherWay]: {
      next: [paths.oauth2.callback],
      exit: true,
      controller: steps.proveAnotherWayController
    }
  },
  { logger: LOGGER }
)

const configure = (router: Router) => {
  if (LOGGER.isLevelEnabled('debug')) walkWizard(openBankingJourney, LOGGER)
  router.use(paths.oauth2.index, commonExpress.routes.oauth2)
  router.get(paths.index, (_req, res) => {
    res.redirect(paths.steps.start)
  })
  if (appConfig.STUBS.ENABLED) {
    LOGGER.warn(`${alarmBadge} stubs are enabled`)
    router.get(paths.stubs.webhook, stubs.webhookController.get)
    router.post(paths.stubs.webhook, asyncControllerHandler(stubs.webhookController.post))
  }
  openBankingJourney.register(router)
}

export { configure }
