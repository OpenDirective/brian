import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

import { BaseSources, BaseSinks } from '../interfaces'
import { API_HOST } from '../environment'
import { routes, logout, speech } from '../pageify'
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

    return {
        DOM: vdom$,
        onion: reducer$,
        router: routes(DOM),
        auth0: logout(DOM),
        speech: speech(DOM)
    }
}

function view(state$: Stream<State>): Stream<VNode> {
    return state$.map(result => {
        interface ButtonDef {
            title: string
            id?: string
            page?: string
        }
        const buttonDefs = [
            { title: 'Photo Albums', page: 'photos' },
            { title: 'Counter', page: 'counter' }
        ]
        const buttons = buttonDefs.map(v =>
            <button type="button" className="action key" data-navigate={v.page}>
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
