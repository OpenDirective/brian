import xs, { MemoryStream, Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { ResponseStream, Response, HTTPSource } from '@cycle/HTTP'
import { StateSource } from 'cycle-onionify'
import { Logout } from 'cyclejs-auth0'

import { logout, processResponse } from '../pageify'

import { BaseSources, BaseSinks } from '../interfaces'
import { API_HOST } from '../environment'

// Types
export interface Sources extends BaseSources {
    onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
    onion?: Stream<Reducer>
}

const PHOTOS_URL = `${API_HOST}/api/getPhotoAlbums`
interface Album {
    title: string
    id: string
}

// State
export interface State {
    error: any
    body: string
    albums: Album[]
}
const defaultState: State = {
    error: undefined,
    body: '',
    albums: []
}
export type Reducer = (prev: State) => State | undefined

export function Photos({ HTTP, DOM, onion }: Sources): Sinks {
    const vdom$: Stream<VNode> = view(onion.state$)

    const request$ = xs.of({
        url: PHOTOS_URL,
        method: 'get',
        category: 'request-albums',
        accept: 'application/json'
        // bearer header is added by auth0ify
    })

    const init$ = xs.of<Reducer>(
        prevState => (prevState === undefined ? defaultState : prevState)
    )

    const responseStreams = processResponse(HTTP.select('request-albums')) // TODO will actiosn be better??

    const photos$ = responseStreams.response$.map<
        Reducer
    >(({ errorDetails, body }) => state => ({
        ...state,
        albums: body
    }))

    const reducers$ = xs.merge(init$, photos$)

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: reducers$,
        router: responseStreams.goHome$.debug('h'),
        auth0: xs.merge(logout(DOM), responseStreams.logout$.debug('l')),
        error: responseStreams.error$.map(e => JSON.stringify(e, undefined, 4))
    }
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(state => {
        const buttons = state.albums.map(v =>
            <button
                type="button"
                className="action key"
                data-action="view"
                data-value={v.id}
            >
                {v.title}
            </button>
        )

        return (
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
                        {buttons}
                    </main>
                </div>
            </div>
        )
    })
}
