// based on the npm package azure-functions-auth0
// But modified to handle the Auth0 API accessToken

const jwt = require('express-jwt')
//import ArgumentError from './errors/ArgumentError';
const ArgumentError = Error

module.exports = options => {
    if (!options || !(options instanceof Object)) {
        throw new ArgumentError('The options must be an object.')
    }

    if (!options.clientId || options.clientId.length === 0) {
        throw new ArgumentError(
            'The Auth0 Client or API ID has to be provided.'
        )
    }

    if (!options.clientSecret || options.clientSecret.length === 0) {
        throw new ArgumentError(
            'The Auth0 Client or API Secret has to be provided.'
        )
    }

    if (!options.domain || options.domain.length === 0) {
        throw new ArgumentError('The Auth0 Domain has to be provided.')
    }

    const middleware = jwt({
        secret: options.clientSecret,
        audience: options.clientId,
        issuer: options.domain,
        algorithms: options.algorithms
    })

    return next => {
        return (context, req) => {
            middleware(req, null, err => {
                if (err) {
                    const res = {
                        status: err.status || 500,
                        body: {
                            message: err.message
                        }
                    }

                    return context.done(null, res)
                }

                return next(context, req)
            })
        }
    }
}
