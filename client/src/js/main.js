import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http';
import runHot from './runHot'
import App from './components/App'

const drivers = {
  DOM: makeDOMDriver('#root'),
  HTTP: makeHTTPDriver()
}

if (module.hot) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', App, drivers)
} else {
  run(App, drivers)
}
