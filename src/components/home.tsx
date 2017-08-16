import xs, { MemoryStream, Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { ResponseStream, HTTPSource } from '@cycle/HTTP'
import { StateSource } from 'cycle-onionify'

import { BaseSources, BaseSinks } from '../interfaces'
import { API_HOST } from '../environment'

// Types
export interface Sources extends BaseSources {
    onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
    onion?: Stream<Reducer>
}

// State
export interface State {
    error: any
    body: string
}
const defaultState: State = {
    error: false,
    body: ''
}
export type Reducer = (prev: State) => State | undefined

const PHOTOS_URL = `${API_HOST}/api/getGoogleAlbums`

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

    const photosAction$ = DOM.select('[data-action="fetch-photos"]').events(
        'click'
    )
    const request$ = photosAction$.map(accessToken => ({
        url: PHOTOS_URL,
        method: 'get',
        category: 'request-photos'
        // bearer header is added by auth0ify
    }))

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

    const response$$ = HTTP.select('request-photos')
    const photos$ = response$$
        .map(response$ =>
            response$.replaceError((error: any) => {
                if (error.response) {
                    error.response.error.message =
                        error.response.error.message + ' ' + error.response.text
                }
                return xs.of(
                    error.response ? error.response : { error, body: '' }
                )
            })
        )
        .flatten()
        .map<Reducer>(({ error, body }) => state => ({
            ...state,
            error: error.message,
            body
        }))

    return xs.merge(init$, photos$)
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$
        .map(state => (state.error ? state.error : state.body))
        .map(result =>
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
                <div className="result">
                    {result}
                </div>
            </div>
        )
}
