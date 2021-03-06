import { Stream } from 'xstream'
import { DOMSource, VNode } from '@cycle/dom'
import { HTTPSource, RequestOptions } from '@cycle/http'
import { TimeSource } from '@cycle/time'
import { RouterSource, HistoryAction } from 'cyclic-router'
import { Auth0Source, Auth0Request } from 'cyclejs-auth0'

export type Component = (s: BaseSources) => BaseSinks

export interface BaseSources {
    DOM: DOMSource
    HTTP: HTTPSource
    time: TimeSource
    router: RouterSource
    storage: any
    auth0: Auth0Source
}

export interface BaseSinks {
    DOM?: Stream<VNode>
    HTTP?: Stream<RequestOptions>
    router?: Stream<HistoryAction>
    storage?: Stream<any>
    speech?: Stream<string>
    auth0?: Stream<Auth0Request>
    error?: Stream<string>
}
