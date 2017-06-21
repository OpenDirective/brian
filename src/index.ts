import { setup, run } from '@cycle/run'
import { restartable, rerunner } from 'cycle-restart'
import isolate from '@cycle/isolate'
import onionify from 'cycle-onionify'

import { drivers, Component } from './drivers'
import { App } from './app'

const main: Component = onionify(App)

/// #if PRODUCTION
run(main as any, drivers)

/// #else
const driverFn = () => ({
    ...drivers,
    DOM: restartable(drivers.DOM, {
        pauseSinksWhileReplaying: false
    }),
    HTTP: restartable(drivers.HTTP)
})

const rerun = rerunner(setup, driverFn, isolate)
rerun(main as any)

if (module.hot) {
    module.hot.accept('./app', () => {
        const newApp = require('./app').App

        rerun(onionify(newApp))
    })
}
/// #endif
