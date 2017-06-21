import xs, { Stream } from 'xstream'
import { makeDOMDriver, VNode, DOMSource } from '@cycle/dom'
import { makeHTTPDriver, HTTPSource, RequestOptions } from '@cycle/http'
import { timeDriver, TimeSource } from '@cycle/time'
import speechDriver from './drivers/speech'

export const drivers: any = {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    Time: timeDriver,
    Speech: speechDriver
}

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

export const driverNames: string[] = Object.keys(drivers)

// Cycle apps (main functions) are allowed to return any number of sinks streams
// This sets defaults for all drivers that are not returned by the app
export const allSinks: (
    a: Component
) => (s: DriverSources) => DriverSinks = app => sources => ({
    ...driverNames.map(n => ({ [n]: xs.never() })).reduce(Object.assign, {}),
    ...app(sources)
})

export type Sources = DriverSources
export type Sinks = Partial<DriverSinks>
export type Component = (s: Sources) => Sinks
