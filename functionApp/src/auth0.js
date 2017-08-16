const request = require('request')

const AUTH0_DOMAIN_URL = process.env.AUTH0_DOMAIN_URL
const AUTH0_API_ID = process.env.AUTH0_API_ID
const AUTH0_API_SIGNING_CERTIFICATE = process.env.AUTH0_API_SIGNING_CERTIFICATE
const AUTH0_ADMIN_CLIENT_ID = process.env.AUTH0_ADMIN_CLIENT_ID
const AUTH0_ADMIN_CLIENT_SECRET = process.env.AUTH0_ADMIN_CLIENT_SECRET

const auth0BianAPIConfig = {
    clientId: AUTH0_API_ID,
    clientSecret: AUTH0_API_SIGNING_CERTIFICATE,
    algorithms: ['RS256'],
    domain: `${AUTH0_DOMAIN_URL}/`
}

// Create decorator that checks the JWT signature and specified fields
exports.auth0ifyBrianAPI = require('./auth0ify')(auth0BianAPIConfig)

// Call a remote HTTP endpoint and return a JSON object
exports.requestObject = requestObject = (options) => {
    return new Promise((resolve, reject) => {
        request(options, function(error, response, body) {
            if (error) {
                reject(error)
            } else if (200 > response.statusCode || 299 < response.statusCode) {
                reject(
                    new Error(
                        `Resource ${options.url} returned status code: ${response.statusCode}: ${body}`
                    )
                )
            } else {
                const object =
                    typeof body === 'string' ? JSON.parse(body) : body // FIXME throws
                resolve({ code: response.statusCode, object })
            }
        })
    })
}

// Get an access token for the Auth0 Admin API
exports.getAdminAccessToken = () => {
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
    return requestObject(options)
}

// Get the user's profile from the Admin API
exports.getUserProfile = (accessToken, userID) => {
    const options = {
        method: 'GET',
        url: `${AUTH0_DOMAIN_URL}/api/v2/users/${userID}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json'
        }
    }
    return requestObject(options)
}
