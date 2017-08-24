import xs, { MemoryStream, Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { ResponseStream, HTTPSource } from '@cycle/HTTP'
import { StateSource } from 'cycle-onionify'
import { Logout } from 'cyclejs-auth0'

import { BaseSources, BaseSinks } from '../interfaces'
import { API_HOST } from '../environment'

function speech(DOM: DOMSource): Stream<string> {
    return DOM.select('[data-speech]').events('click').map(e => {
        const he = e.target as HTMLElement
        const value = he.dataset.speech as string
        const text = he.textContent ? he.textContent : ''
        const speech = value === '<text>' ? text : value
        return speech
    })
}

function routes(DOM: DOMSource): Stream<string> {
    return DOM.select('[data-navigate]')
        .events('click')
        .map(e => {
            const he = e.target as HTMLElement
            const route = he.dataset.navigate as string
            return `/${route}`
        })
        .debug('routing to')
}

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

const PHOTOS_URL = `${API_HOST}/api/getPhotoAlbums`

export function Home({ DOM, onion }: Sources): Sinks {
    const vdom$: Stream<VNode> = view(onion.state$)
    const init$ = xs
        .of<Reducer>(
            prevState => (prevState === undefined ? defaultState : prevState)
        )
        .filter(() => true)
    const reducer$ = init$

    const logout$ = DOM.select('[data-action="logout"]')
        .events('click')
        .mapTo({ action: 'logout' } as Logout)

    return {
        DOM: vdom$,
        onion: reducer$,
        router: routes(DOM),
        auth0: logout$,
        speech: speech(DOM)
    }
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$
        .map(state => (state.error ? state.error : state.body))
        .map(result =>
            <div>
                <div className="wrapper">
                    <header className="header">
                        <button
                            type="button"
                            className="header-title key"
                            data-speech="<text>"
                        >
                            Touch the photo album you want to view &#x1f50a;
                        </button>
                        <button
                            type="button"
                            className="header-logout key"
                            data-action="logout"
                        >
                            Logout
                        </button>
                    </header>

                    <main className="grid">
                        <button
                            type="button"
                            className="action key"
                            data-navigate="photos"
                        >
                            View Photos
                        </button>
                    </main>
                </div>
                <footer className="result">
                    {JSON.stringify(result, undefined, 4)}
                </footer>
            </div>
        )
}
