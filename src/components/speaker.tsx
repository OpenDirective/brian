import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { RouterSource, RouteMatcher } from 'cyclic-router'

import { BaseSources, BaseSinks } from '../interfaces'

// Types
export interface Sources extends BaseSources {
    onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
    onion: Stream<Reducer>
}

// State
export interface State {
    text: string
}
const defaultState: State = { text: 'Edit me!' }
export type Reducer = (prev?: State) => State | undefined

export function Speaker({ DOM, onion }: Sources): Sinks {
    const action$: Stream<Reducer> = intent(DOM)
    const vdom$: Stream<VNode> = view(onion.state$)

    const touchSpeech$ = DOM.select('[data-action="speak"]')
        .events('click')
        .map(({ currentTarget }) => (currentTarget as Element).textContent)
        .map(text => (typeof text === 'string' ? text : ''))

    const routes$ = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo('/')

    const logout$ = DOM.select('[data-action="logout"]')
        .events('click')
        .mapTo({ action: 'logout' })

    return {
        DOM: vdom$,
        speech: touchSpeech$,
        onion: action$,
        router: routes$,
        auth0: logout$
    }
}

function intent(DOM: DOMSource): Stream<Reducer> {
    //const init$: Stream<Reducer> = xs.of<Reducer>(p => ({ count: 10 }))
    const init$ = xs.of<Reducer>(
        prevState => (prevState === undefined ? defaultState : prevState)
    )

    const textValue$: Stream<Reducer> = DOM.select('#text')
        .events('input')
        .map((ev: any) => ev.target.value)
        .map<Reducer>(value => () => ({ text: value }))

    return xs.merge(init$, textValue$)
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({ text }) =>
        <div>
            <h2>My Awesome Cycle.js app - Page 2</h2>
            <textarea id="text" rows="3" value={text} />
            <button type="button" data-action="speak">
                Speak to Me!
            </button>
            <button type="button" data-action="navigate">
                Page 1
            </button>
            <button type="button" data-action="logout">
                Logout
            </button>
        </div>
    )
}
