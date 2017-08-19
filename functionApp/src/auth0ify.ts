// based on the npm package azure-functions-auth0
// But modified to handle the Auth0 API accessToken
import {
    HttpContext,
    IFunctionRequest,
    HttpStatusCodes
} from 'azure-functions-typescript'
const jwt = require('express-jwt')
//import ArgumentError from './errors/ArgumentError';
const ArgumentError = Error

export interface Auth0FunctionRequest extends IFunctionRequest {
    user: any
}

export interface Auth0ifyOptions {
    clientId: string
    clientSecret: string
    algorithms: string[]
    domain: string
}

export const auth0ify = (options: Auth0ifyOptions) => {
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

    return (
        requiredScopes: string[],
        next: (c: HttpContext, r: Auth0FunctionRequest) => any
    ) => {
        return (context: HttpContext, req: Auth0FunctionRequest) => {
            middleware(req, null, (err: any) => {
                if (err) {
                    const res = {
                        status: err.status || 500,
                        body: {
                            message: err.message
                        }
                    }

                    return context.done(null, res)
                }
                const allowedScopes = req.user.scope.split(' ')
                const sufficent = requiredScopes.every(
                    scope => allowedScopes.indexOf(scope) !== -1
                )
                if (!sufficent) {
                    const res = {
                        status: 403,
                        body: {
                            message: 'Forbidden'
                        }
                    }

                    return context.done(null, res)
                }

                return next(context, req)
            })
        }
    }
}
