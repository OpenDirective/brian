import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {useQueries, createHistory, createHashHistory} from 'history'
import speechDriver from './drivers/speech'
import mkLocalStorageDriver from './drivers/localStorage'
import defaultConfig from './media.js'

import runHot from './runHot'
import App from './components/App'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const drivers = {
  DOM: makeDOMDriver('#root'),
  history: makeHistoryDriver(history, {capture: false}),
  speech: speechDriver,
  localStorage: mkLocalStorageDriver('config', defaultConfig)
}

if (module.hot && false) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', App, drivers)
} else {
  run(App, drivers)
}
