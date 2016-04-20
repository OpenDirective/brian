import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {useQueries, createHistory, createHashHistory} from 'history'
import speechDriver from './drivers/speech'
import mkLocalStorageDriver from './drivers/localStorage'
import defaultConfig from './config/defaultConfig.js'
import defaultSettings from './config/defaultSettings.js'
import addGlobalErrorHandler from './globalError'

import runHot from './runHot'
import App from './components/App'

const PRODUCTION = (process.env.NODE_ENV === 'production')

// note while this is usefull it breaks the source mapping in console error messages
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
  settings: mkLocalStorageDriver('setting', defaultSettings)
}

if (!PRODUCTION && module.hot) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', App, drivers)
} else {
  run(App, drivers)
}
