import xs, { Stream } from 'xstream'
import { Sources as BaseSources, Sinks as BaseSinks } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'
import { timeDriver } from '@cycle/time'
import { makeRouterDriver, RouteMatcher } from 'cyclic-router'
import { createBrowserHistory } from 'history'
import switchPath from 'switch-path'
import storageDriver from '@cycle/storage'
import speechDriver from './drivers/speech'
import { makeAuth0Driver, protect as auth0ify } from 'cyclejs-auth0'

import onionify from 'cycle-onionify'
import storageify from 'cycle-storageify'
import { Component } from './interfaces'

export type DriverThunk = Readonly<[string, () => any]> & [string, () => any] // work around readonly
export type DriverThunkMapper = (t: DriverThunk) => DriverThunk

// Set of Drivers used in this App
const driverThunks: ReadonlyArray<DriverThunk> = [
    ['DOM', () => makeDOMDriver('#app')],
    ['HTTP', () => makeHTTPDriver()],
    ['time', () => timeDriver],
    [
        'router',
        () =>
            makeRouterDriver(createBrowserHistory(), switchPath as RouteMatcher)
    ],
    ['storage', () => storageDriver],
    ['speech', () => speechDriver],
    [
        'auth0',
        () =>
            makeAuth0Driver(
                'CoDxjf3YK5wB9y14G0Ee9oXlk03zFuUF',
                'odbrian.eu.auth0.com'
            )
    ]
]

export const buildDrivers = (fn: DriverThunkMapper) =>
    driverThunks
        .map(fn)
        .map(([n, t]: DriverThunk) => ({ [n]: t }))
        .reduce((a, c) => Object.assign(a, c), {})

export const driverNames = driverThunks.map(([n, t]) => n).concat(['onion'])

const auth0ifyOptions = {
    decorators: {
        //let's decorate the HTTP sink
        //the decorate function is given each produced value of the
        //initial sink + the user's token
        speech: (request: any, tokens: any) => {
            console.log('decorator', request, tokens)
            return request
        }
    },
    wibble: 'wobble'
}

export function wrapMain(main: Component): Component {
    return onionify(
        storageify(auth0ify(main, auth0ifyOptions) as any, {
            key: 'brian-state'
        })
    )
}
