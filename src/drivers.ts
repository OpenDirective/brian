import xs, { Stream } from 'xstream'
import { Sources as BaseSources, Sinks as BaseSinks } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { RequestOptions, makeHTTPDriver } from '@cycle/http'
import { timeDriver } from '@cycle/time'
import { makeHistoryDriver } from '@cycle/history'
import { RouteMatcher, routerify } from 'cyclic-router'
import switchPath from 'switch-path'
import storageDriver from '@cycle/storage'
import {
    Auth0Tokens,
    makeAuth0Driver,
    protect as auth0ify
} from 'cyclejs-auth0'
import onionify from 'cycle-onionify'
import storageify from 'cycle-storageify'
import { Component } from './interfaces'
import {
    AUTH0_APPKEY,
    AUTH0_DOMAIN,
    AUTH0_LOCKOPTIONS
} from './config/client-config'

import speechDriver from './drivers/speech'

export type DriverThunk = Readonly<[string, () => any]> & [string, () => any] // work around readonly
export type DriverThunkMapper = (t: DriverThunk) => DriverThunk

// Set of Drivers used in this App
const driverThunks: ReadonlyArray<DriverThunk> = [
    ['DOM', () => makeDOMDriver('#app')],
    ['HTTP', () => makeHTTPDriver()],
    ['time', () => timeDriver],
    ['history', () => makeHistoryDriver()],
    ['storage', () => storageDriver],
    ['speech', () => speechDriver],
    [
        'auth0',
        () => makeAuth0Driver(AUTH0_APPKEY, AUTH0_DOMAIN, AUTH0_LOCKOPTIONS)
    ]
]

export const buildDrivers = (fn: DriverThunkMapper) =>
    driverThunks
        .map(fn)
        .map(([n, t]: DriverThunk) => ({ [n]: t }))
        .reduce((a, c) => Object.assign(a, c), {})

export const driverNames = driverThunks
    .map(([n, t]) => n)
    .concat(['onion', 'router']) // these are added through decoration

// decorate drivers
const AUTH0IFY_OPTIONS = {
    decorators: {
        HTTP: (request: RequestOptions, tokens: Auth0Tokens) => {
            return {
                ...request,
                headers: {
                    ...request.headers,
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            }
        }
    }
}

export function wrapMain(main: Component): Component {
    return routerify(
        onionify(
            storageify(auth0ify(main, AUTH0IFY_OPTIONS) as any, {
                key: 'brian-state',
                debounce: 100 // wait for 100ms without state change before writing to localStorage
            })
        ),
        switchPath as RouteMatcher
    ) as any
}
