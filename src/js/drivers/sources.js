import {makeDOMDriver} from '@cycle/dom'
// import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {createHistory, createHashHistory} from 'history'

import defaultConfig from '../config/default-config.js'
import defaultSettings from '../config/default-settings.js'

import makeAuthDriver from './auth'
import speechDriver from './speech'
// import fullScreenDriver from './fullScreen'
import activityLogDriver from './activity-log.js'
import mkLocalStorageDriver from './local-storage'

const history = supportsHistory() ?
  createHistory() : createHashHistory()


const sources = {
  DOM: makeDOMDriver('#root'),
  auth: makeAuthDriver(),
  history: makeHistoryDriver(history, {capture: false}),
  speech: speechDriver,
  appConfig: mkLocalStorageDriver('config', defaultConfig),
  settings: mkLocalStorageDriver('setting', defaultSettings),
  activityLog: activityLogDriver
//  fullScreen: fullScreenDriver
}

export default sources
