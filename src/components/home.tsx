import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { HTTPSource } from '@cycle/HTTP'
import { StateSource } from 'cycle-onionify'

import { BaseSources, BaseSinks } from '../interfaces'

// Types
export interface Sources extends BaseSources {
    onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
    onion?: Stream<Reducer>
}

// State
export interface State {
    thing: string
}
const defaultState: State = {
    thing: '30'
}
export type Reducer = (prev: State) => State | undefined

export function Home({ HTTP, DOM, onion }: Sources): Sinks {
    const action$: Stream<Reducer> = intent(HTTP)
    const vdom$: Stream<VNode> = view(onion.state$)

    const counterRoute$ = DOM.select(
        '[data-action="navigate"][data-arg="counter"]'
    )
        .events('click')
        .mapTo('/counter')
    const speakerRoute$ = DOM.select(
        '[data-action="navigate"][data-arg="speaker"]'
    )
        .events('click')
        .mapTo('/speaker')
    const routes$ = xs.merge(counterRoute$, speakerRoute$)

    const photosAction$ = DOM.select('[data-action="fetch-photos"]')
        .events('click')
        .debug()
    const request$ = photosAction$
        .mapTo({
            url: 'http://brian.opendirective.net/api/test?name=foo', // GET method by default
            category: 'request-photos'
        })
        .debug()

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: action$,
        router: routes$
    }
}

function intent(HTTP: HTTPSource): Stream<Reducer> {
    const init$ = xs.of<Reducer>(
        prevState => (prevState === undefined ? defaultState : prevState)
    )

    const photos$ = HTTP.select('request-photos')
        .flatten()
        .debug()
        .map<Reducer>(({ body }) => state => ({ ...state, thing: body }))

    return xs.merge(init$, photos$)
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(({}) =>
        <div>
            <h2>Easy access to Photos</h2>
            <button type="button" data-action="navigate" data-arg="counter">
                Counter
            </button>
            <button type="button" data-action="navigate" data-arg="speaker">
                Speaker
            </button>
            <button type="button" data-action="fetch-photos">
                Get Photos
            </button>
        </div>
    )
}
