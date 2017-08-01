import xs, { Stream } from 'xstream'
import { restartable } from 'cycle-restart'
import { makeDOMDriver, VNode, DOMSource } from '@cycle/dom'
import { makeHTTPDriver, HTTPSource, RequestOptions } from '@cycle/http'
import { timeDriver, TimeSource } from '@cycle/time'
import { makeRouterDriver, RouterSource, RouteMatcher } from 'cyclic-router'
import { createBrowserHistory } from 'history'
import switchPath from 'switch-path'
import storageDriver from '@cycle/storage'
import { makeAuth0Driver } from 'cyclejs-auth0'

import speechDriver from './drivers/speech'

let mkDriversCond: any
/// #if PRODUCTION
mkDriversCond = () => ({
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    time: timeDriver,
    router: makeRouterDriver(
        createBrowserHistory(),
        switchPath as RouteMatcher
    ),
    storage: storageDriver,
    speech: speechDriver,
    auth0: makeAuth0Driver(
        'CoDxjf3YK5wB9y14G0Ee9oXlk03zFuUF',
        'odbrian.eu.auth0.com'
    )
})

/// #else
mkDriversCond = () => ({
    DOM: restartable(makeDOMDriver('#app'), {
        pauseSinksWhileReplaying: false
    }),
    HTTP: restartable(makeHTTPDriver()),
    time: timeDriver,
    router: makeRouterDriver(
        createBrowserHistory(),
        switchPath as RouteMatcher
    ),
    storage: storageDriver,
    speech: speechDriver,
    auth0: makeAuth0Driver(
        'CoDxjf3YK5wB9y14G0Ee9oXlk03zFuUF',
        'odbrian.eu.auth0.com'
    )
})
/// #endif
export const mkDrivers = mkDriversCond

export type DriverSources = {
    DOM: DOMSource
    HTTP: HTTPSource
    time: TimeSource
    router: RouterSource
    storage: any
    auth0: Auth0Source
}

export type DriverSinks = Partial<{
    DOM: Stream<VNode>
    HTTP: Stream<RequestOptions>
    router: Stream<any>
    storage: Stream<any>
    speech: Stream<string>
    auth0: Stream<Auth0Actions>
}>

export type Component = (s: DriverSources) => DriverSinks
export type ComponentWrapper = (c: Component) => Component
export const driverNames: string[] = Object.keys(mkDrivers()).concat(['onion'])
