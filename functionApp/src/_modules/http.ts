import * as request from 'request'

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
                reject(
                    new Error(
                        `Resource ${options.url} returned status code: ${response.statusCode}: ${body}`
                    )
                )
            } else {
                const object =
                    typeof body === 'string' ? JSON.parse(body) : body // FIXME throws
                resolve(object)
            }
        })
    })
}
