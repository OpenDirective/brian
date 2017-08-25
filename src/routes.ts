import { Component } from './interfaces'
import { Home } from './components/home'
import { Photos } from './components/photos'

export interface RouteValue {
    component: Component
    scope: string
}
export interface Routes {
    readonly [index: string]: RouteValue
}

export const routes: Routes = {
    '/': { component: Home, scope: 'home' },
    '/photos': { component: Photos, scope: 'photos' }
}

export const initialRoute = '/'
