import { setup, run } from '@cycle/run'
import { rerunner } from 'cycle-restart'
import isolate from '@cycle/isolate'
import onionify from 'cycle-onionify'
import storageify from 'cycle-storageify'
import { protect as auth0ify } from 'cyclejs-auth0' // TODO PR to add missing typeings

import { mkDrivers, Component } from './drivers'
import { App } from './app'

const main: Component = onionify(
    storageify(auth0ify(App), { key: 'brian-state' })
)

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
