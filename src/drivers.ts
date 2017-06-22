import xs, { Stream } from 'xstream'
import { restartable } from 'cycle-restart'
import { makeDOMDriver, VNode, DOMSource } from '@cycle/dom'
import { makeHTTPDriver, HTTPSource, RequestOptions } from '@cycle/http'
import { timeDriver, TimeSource } from '@cycle/time'
import speechDriver from './drivers/speech'

let mkDriversCond: any
/// #if PRODUCTION
mkDriversCond = () => ({
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    Time: timeDriver,
    Speech: speechDriver
})

/// #else
mkDriversCond = () => ({
    DOM: restartable(makeDOMDriver('#app'), {
        pauseSinksWhileReplaying: false
    }),
    HTTP: restartable(makeHTTPDriver()),
    Time: timeDriver,
    Speech: speechDriver
})
/// #endif
export const mkDrivers = mkDriversCond

export type DriverSources = {
    DOM: DOMSource
    HTTP: HTTPSource
    Time: TimeSource
}

export type DriverSinks = {
    DOM: Stream<VNode>
    HTTP: Stream<RequestOptions>
    Speech: Stream<string>
}

//export const driverNames: string[] = Object.keys(drivers)
export type Sources = DriverSources
export type Sinks = Partial<DriverSinks>
export type Component = (s: Sources) => Sinks
