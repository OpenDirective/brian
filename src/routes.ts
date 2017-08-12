import { Component } from './interfaces'
import { Home } from './components/home'
import { Counter } from './components/counter'
import { Speaker } from './components/speaker'

export interface RouteValue {
    component: Component
    scope: string
}
export interface Routes {
    readonly [index: string]: RouteValue
}

export const routes: Routes = {
    '/': { component: Home, scope: 'home' },
    '/counter': { component: Counter, scope: 'counter' },
    '/speaker': { component: Speaker, scope: 'speaker' }
}

export const initialRoute = '/'
