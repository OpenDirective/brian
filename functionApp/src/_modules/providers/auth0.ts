//import request = require('request') // note the namespace is also 'request' not 'Request'
import { requestObject } from '../httpUtils'
import { Auth0ifyOptions, Auth0FunctionRequest, auth0ify } from './auth0ify'

// TODO check all defined
const AUTH0_DOMAIN_URL: string = <string>process.env.AUTH0_DOMAIN_URL
const AUTH0_API_ID: string = <string>process.env.AUTH0_API_ID
const AUTH0_API_SIGNING_CERTIFICATE: string = <string>process.env
    .AUTH0_API_SIGNING_CERTIFICATE
const AUTH0_ADMIN_CLIENT_ID: string = <string>process.env.AUTH0_ADMIN_CLIENT_ID
const AUTH0_ADMIN_CLIENT_SECRET: string = <string>process.env
    .AUTH0_ADMIN_CLIENT_SECRET

const auth0BianAPIConfig: Auth0ifyOptions = {
    clientId: AUTH0_API_ID,
    clientSecret: AUTH0_API_SIGNING_CERTIFICATE,
    algorithms: ['RS256'],
    domain: `${AUTH0_DOMAIN_URL}/`
}

export const auth0ifyBrianAPI = auth0ify(auth0BianAPIConfig)

export interface OAuthAdminToken {
    access_token: string
    expires_in: number
    scope: string
    token_type: 'Bearer'
}

// Get an access token for the Auth0 Admin API
export function getAdminAccessToken(): Promise<OAuthAdminToken> {
    const options = {
        method: 'POST',
        url: `${AUTH0_DOMAIN_URL}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        body: {
            client_id: AUTH0_ADMIN_CLIENT_ID,
            client_secret: AUTH0_ADMIN_CLIENT_SECRET,
            audience: `${AUTH0_DOMAIN_URL}/api/v2/`,
            grant_type: 'client_credentials'
        },
        json: true
    }
    return requestObject<OAuthAdminToken>(options)
}

export interface OAuthUserProfile {
    identities: [
        {
            access_token: string
        }
    ]
}

// Get the user's profile from the Admin API
export function getUserProfile(
    accessToken: string,
    userID: string
): Promise<OAuthUserProfile> {
    const options = {
        method: 'GET',
        url: `${AUTH0_DOMAIN_URL}/api/v2/users/${userID}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json'
        }
    }
    return requestObject<OAuthUserProfile>(options)
}

export async function getProviderAccessToken(userId: string): Promise<string> {
    const { access_token: adminAccessToken } = await getAdminAccessToken()
    const { identities } = await getUserProfile(adminAccessToken, userId)
    return identities[0].access_token // Note is hidden in the Auth0 console
}
