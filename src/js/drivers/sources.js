import {makeDOMDriver} from '@cycle/dom'
// import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {createHistory, createHashHistory} from 'history'

import defaultConfig from '../config/defaultConfig.js'
import defaultSettings from '../config/defaultSettings.js'

import makeAuthDriver from './auth'
import speechDriver from './speech'
// import fullScreenDriver from './fullScreen'
import activityLogDriver from './activityLog.js'
import mkLocalStorageDriver from './localStorage'

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
