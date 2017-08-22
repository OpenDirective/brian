import * as request from 'request'
import { STATUS_CODES } from 'http'

export class HTTPError extends Error {
    public statusCode: number
    constructor(statusCode: number, message: string) {
        super(
            `Response ${statusCode} (${STATUS_CODES[statusCode]}) - ${message}`
        )
        this.name = 'HTTPError'
        this.statusCode = statusCode
    }
}
// Call a remote HTTP endpoint and return a JSON object
export function requestObject<T>(options: request.OptionsWithUrl): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error)
            } else if (
                200 > (<number>response.statusCode) ||
                299 < (<number>response.statusCode)
            ) {
                const message =
                    typeof body !== 'string' ? JSON.stringify(body) : body
                reject(new HTTPError(<number>response.statusCode, body))
            } else {
                const object =
                    typeof body === 'string' ? JSON.parse(body) : body // FIXME throws
                resolve(object)
            }
        })
    })
}
