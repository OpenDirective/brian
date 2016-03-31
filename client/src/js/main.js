import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver, supportsHistory} from '@cycle/history'
import {useQueries, createHistory, createHashHistory} from 'history'
import runHot from './runHot'
import App from './components/App'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const drivers = {
  DOM: makeDOMDriver('#root'),
  HTTP: makeHTTPDriver(),
  history: makeHistoryDriver(history, {capture: false})
}

if (module.hot) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', App, drivers)
} else {
  run(App, drivers)
}
