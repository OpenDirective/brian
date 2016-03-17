import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {isolate} from '@cycle/isolate'
import {restart, restartable} from 'cycle-restart'
import App from './components/App'

const drivers = {
  DOM: makeDOMDriver('#root')
}

function makeDriversRestartable(drivers) {
  const keys = drivers.keys
  const wrappedDrivers = keys.map(k => restartable(drivers[k],
                                           {pauseSinksWhileReplaying: false})
                         )
  return wrappedDrivers
}

if (module.hot) {   // hot loading enabled in config
  console.log('Hot reloading enabled')

  const restartableDrivers = makeDriversRestartable(drivers)
  const {sinks, sources} = run(App, restartableDrivers)

  module.hot.accept('./components/App', () => {
    const app = require('./components/App').default
    restart(app, restartableDrivers, {sinks, sources}, isolate)
  })
} else {
  run(App, drivers)
}
