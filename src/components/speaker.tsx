import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { RouterSource, RouteMatcher } from 'cyclic-router'
import { Auth0Request, Logout } from 'cyclejs-auth0'

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

// Actions
const SPEECH = 'speech',
    NAVIGATE = 'navigate',
    UPDATE = 'update',
    LOGOUT = 'logout'
interface SpeechAction {
    type: typeof SPEECH
}
interface NavigationAction {
    type: typeof NAVIGATE
}
interface UpdateAction {
    type: typeof UPDATE
    reducer: Reducer
}
interface LogoutAction {
    type: typeof LOGOUT
}
type Action = SpeechAction | NavigationAction | UpdateAction | LogoutAction

export function Speaker({ DOM, onion }: Sources): Sinks {
    const action$: Stream<Action> = intent(DOM)

    return {
        DOM: view(onion.state$),
        speech: speech(action$, onion.state$),
        onion: onionFn(action$),
        router: router(action$),
        auth0: logout(action$)
    }
}

function logout(action$: Stream<Action>): Stream<Auth0Request> {
    return action$
        .filter(({ type }) => type === LOGOUT)
        .mapTo({ action: 'logout' } as Logout)
}

function router(action$: Stream<Action>): Stream<string> {
    return action$.filter(({ type }) => type === NAVIGATE).mapTo('/')
}

function speech(
    action$: Stream<Action>,
    state$: Stream<State>
): Stream<string> {
    return action$
        .filter(({ type }) => type === SPEECH)
        .compose(sampleCombine(state$))
        .map<string>(([_, s]) => s.text)
}

function intent(DOM: DOMSource): Stream<Action> {
    const updateText$: Stream<Action> = DOM.select('#text')
        .events('input')
        .map((ev: any) => ev.target.value)
        .map<Action>((value: string) => ({
            type: UPDATE,
            reducer: () => ({ text: value })
        }))

    const speech$: Stream<Action> = DOM.select('[data-action="speak"]')
        .events('click')
        .mapTo<Action>({ type: SPEECH })

    const navigation$: Stream<Action> = DOM.select('[data-action="navigate"]')
        .events('click')
        .mapTo<Action>({ type: NAVIGATE })

    const logout$: Stream<Action> = DOM.select('[data-action="logout"]')
        .events('click')
        .mapTo<Action>({ type: LOGOUT })

    return xs.merge(updateText$, speech$, navigation$, logout$)
}

function onionFn(action$: Stream<Action>): Stream<Reducer> {
    const init$ = xs.of<Reducer>(
        prevState => (prevState === undefined ? defaultState : prevState)
    )

    const update$: Stream<Reducer> = action$
        .filter(({ type }) => type === UPDATE)
        .map<Reducer>((action: UpdateAction) => action.reducer)

    return xs.merge(init$, update$)
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
