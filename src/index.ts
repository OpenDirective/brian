import { setup, run } from '@cycle/run'
import { rerunner } from 'cycle-restart'
import isolate from '@cycle/isolate'
import onionify from 'cycle-onionify'
import storageify from 'cycle-storageify'
import { protect as auth0ify } from 'cyclejs-auth0'
import { restartable } from 'cycle-restart'

import { buildDrivers, Component } from './drivers'
import { App } from './components/app'

const main: Component = onionify(
    storageify(auth0ify(App), { key: 'brian-state' })
)

/// #idef !PRODUCTION
run(main, buildDrivers(([k, t]) => [k, t()]))

/// #else
const mkDrivers = () =>
    buildDrivers(([k, t]) => {
        if (k === 'DOM') {
            return [k, restartable(t(), { pauseSinksWhileReplaying: false })]
        }
        if (k === 'time') {
            return [k, t()]
        }
        return [k, restartable(t())]
    })
const rerun = rerunner(setup, mkDrivers, isolate)
/// #endif
