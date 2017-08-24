import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { extractSinks } from 'cyclejs-utils'

import { driverNames } from '../drivers'
import { BaseSources, BaseSinks } from '../interfaces'
import { RouteValue, routes, initialRoute } from '../routes'

// FIXME
const protect: any = require('cyclejs-auth0').protect // TODO PR to add missing typeings

// Types
import { State as CounterState } from './counter'
import { State as SpeakerState } from './speaker'

export interface Sources extends BaseSources {
    onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
    onion?: Stream<Reducer>
}

// State
export interface State {
    counter: CounterState
    speaker?: SpeakerState
}
const defaultState: State = {
    counter: { count: 5 },
    speaker: undefined // use conmponent default
}
export type Reducer = (prev?: State) => State | undefined

export function App(sources: Sources): Sinks {
    sources.onion.state$.addListener({}) // might help keep state working

    const initReducer$ = xs
        .of<Reducer>(
            prevState => (prevState === undefined ? defaultState : prevState)
        )
        .filter(() => true)

    const routeMatch$ = sources.router.define(routes)

    const componentSinks$ = routeMatch$.map(
        ({ path, value }: { path: string; value: RouteValue }) => {
            const { component, scope } = value
            return isolate(component, scope)({
                ...sources,
                router: sources.router.path(path)
            })
        }
    )

    const sinks = extractSinks(componentSinks$, driverNames)
    return {
        ...sinks,
        onion: xs.merge(initReducer$, sinks.onion)
    }
}
