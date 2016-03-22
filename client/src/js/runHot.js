import {run} from '@cycle/core'
import {isolate} from '@cycle/isolate'
import {restart, restartable} from 'cycle-restart'
import mapValues from 'lodash/mapValues'

function runHot(appFile, App, drivers) {
  const restartableDrivers = mapValues(drivers,
                      v => {
                        return restartable(v, {pauseSinksWhileReplaying: false})
                      })
  const {sinks, sources} = run(App, restartableDrivers)
  module.hot.accept(appFile, () => {
    restart(App, restartableDrivers, {sinks, sources}, isolate)
  })
}

export default runHot
