import { setup, run } from '@cycle/run'
import { rerunner } from 'cycle-restart'
import isolate from '@cycle/isolate'
import onionify from 'cycle-onionify'

import { mkDrivers, Component } from './drivers'
import { App } from './app'

const main: Component = onionify(App)

/// #if PRODUCTION
run(main as any, mkDrivers())

/// #else

const rerun = rerunner(setup, mkDrivers, isolate)
rerun(main as any)

if (module.hot) {
    module.hot.accept('./app', () => {
        const newApp = require('./app').App

        rerun(onionify(newApp))
    })
}
/// #endif
