import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {useQueries, createHistory, createHashHistory} from 'history'
import speechDriver from './drivers/speech'
import mkLocalStorageDriver from './drivers/localStorage'
import defaultConfig from './config/defaultConfig.js'
import addGlobalErrorHandler from './globalError'

import runHot from './runHot'
import App from './components/App'

const PRODUCTION = (process.env.NODE_ENV === 'production')

if (!PRODUCTION) {
//  addGlobalErrorHandler()
}

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const drivers = {
  DOM: makeDOMDriver('#root'),
  history: makeHistoryDriver(history, {capture: false}),
  speech: speechDriver,
  appConfig: mkLocalStorageDriver('config', defaultConfig),
  settings: mkLocalStorageDriver('setting', {level: 0, changes: 1})
}

if (!PRODUCTION && module.hot && false) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', App, drivers)
} else {
  run(App, drivers)
}
