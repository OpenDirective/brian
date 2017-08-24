import xs, { MemoryStream, Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { ResponseStream, Response, HTTPSource } from '@cycle/HTTP'
import { StateSource } from 'cycle-onionify'
import { Logout } from 'cyclejs-auth0'

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

interface ErrorDetails {
    status: number
    statusDescription: string
    message: string
    url: string
}

interface MyResponse extends Response {
    errorDetails?: ErrorDetails
}

interface ResponseStreams {
    [index: string]: Stream<any>
}

function processResponse(
    response$$: Stream<MemoryStream<MyResponse> & ResponseStream>
): ResponseStreams {
    const extendedResponse$ = response$$
        .map(response$ => {
            let _response: MyResponse
            response$.map(response => {
                _response = response
                return response
            })
            return response$.replaceError((error: any) => {
                const err: ErrorDetails = {
                    status: error.status,
                    statusDescription: error.message,
                    message:
                        error.response.body && error.response.body.message
                            ? error.response.body.message
                            : error.response.text,
                    url:
                        error.response && error.response.error
                            ? error.response.error.url
                            : ''
                }
                return xs.of({ ..._response, errorDetails: err } as MyResponse)
            })
        })
        .flatten()

    const unorthorised$ = extendedResponse$
        .filter(
            ({ errorDetails }) => !!errorDetails && errorDetails.status === 401
        )
        .map(({ errorDetails }) => errorDetails)
        .debug('u')

    const error$ = extendedResponse$
        .filter(
            ({ errorDetails }) => !!errorDetails && errorDetails.status !== 401
        )
        .map(({ errorDetails }) => errorDetails)
        .debug('e')

    const response$ = extendedResponse$
        .filter(({ errorDetails }) => !errorDetails)
        .debug('e')

    const goHome$ = unorthorised$.mapTo('/home')
    const logout$ = unorthorised$.mapTo({ action: 'logout' } as Logout)

    return {
        error$,
        goHome$,
        logout$,
        response$: response$
    }
}

export function Photos({ HTTP, DOM, onion }: Sources): Sinks {
    const vdom$: Stream<VNode> = view(onion.state$)

    const request$ = xs
        .of({
            url: PHOTOS_URL,
            method: 'get',
            category: 'request-albums',
            accept: 'application/json'
            // bearer header is added by auth0ify
        })
        .debug('request')

    const init$ = xs
        .of<Reducer>(
            prevState => (prevState === undefined ? defaultState : prevState)
        )
        .debug('i')

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
        onion: reducers$.debug('r'),
        router: responseStreams.goHome$.debug('h'),
        auth0: responseStreams.logout$.debug('l')
    }
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.debug('pv').map(state =>
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
                        {state.albums ? state.albums[0].title : 'none'}
                    </button>
                </main>
            </div>
            <footer className="result">
                {JSON.stringify(state.body, undefined, 4)}
            </footer>
        </div>
    )
}
