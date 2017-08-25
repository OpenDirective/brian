import xs, { MemoryStream, Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'
import { Response, ResponseStream, HTTPSource } from '@cycle/HTTP'
import { Logout } from 'cyclejs-auth0'

export function speech(DOM: DOMSource): Stream<string> {
    return DOM.select('[data-speech]').events('click').map(e => {
        const he = e.target as HTMLElement
        const value = he.dataset.speech as string
        const text = he.textContent ? he.textContent : ''
        const speech = value === '<text>' ? text : value
        return speech
    })
}

export function routes(DOM: DOMSource): Stream<string> {
    return DOM.select('[data-navigate]').events('click').map(e => {
        const he = e.target as HTMLElement
        const route = he.dataset.navigate as string
        return `/${route}`
    })
}

export function logout(DOM: DOMSource): Stream<Logout> {
    return DOM.select('[data-action="logout"]')
        .events('click')
        .mapTo({ action: 'logout' } as Logout)
}

export interface ErrorDetails {
    status: number
    statusDescription: string
    message: string
    url: string
}

export interface MyResponse extends Response {
    errorDetails?: ErrorDetails
}

export interface ResponseStreams {
    [index: string]: Stream<any>
}

export function processResponse(
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
                    status: error.status ? error.status : '',
                    statusDescription: error.status ? error.message : '',
                    message: error.response
                        ? error.response.body && error.response.body.message
                          ? error.response.body.message
                          : error.response.text
                        : error.message,
                    url:
                        error.response && error.response.error
                            ? error.response.error.url
                            : error.url
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

    const error$ = extendedResponse$
        .filter(
            ({ errorDetails }) => !!errorDetails && errorDetails.status !== 401
        )
        .map(({ errorDetails }) => errorDetails)

    const response$ = extendedResponse$.filter(
        ({ errorDetails }) => !errorDetails
    )

    const goHome$ = unorthorised$.mapTo('/')
    const logout$ = unorthorised$.mapTo({ action: 'logout' } as Logout)

    return {
        error$,
        goHome$,
        logout$,
        response$: response$
    }
}
