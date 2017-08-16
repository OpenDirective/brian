const request = require('request')

const AUTH0_DOMAIN_URL = process.env.AUTH0_DOMAIN_URL
const AUTH0_API_ID = process.env.AUTH0_API_ID
const AUTH0_API_SIGNING_CERTIFICATE = process.env.AUTH0_API_SIGNING_CERTIFICATE
const AUTH0_ADMIN_CLIENT_ID = process.env.AUTH0_ADMIN_CLIENT_ID
const AUTH0_ADMIN_CLIENT_SECRET = process.env.AUTH0_ADMIN_CLIENT_SECRET

console.log ("zzzzzzz",AUTH0_DOMAIN_URL)


// Call a remote HTTP endpoint and return a JSON object
function requestObject(options) {
    return new Promise((resolve, reject) => {
        request(options, function(error, response, body) {
            if (error) {
                reject(error)
            } else if (200 > response.statusCode || 299 < response.statusCode) {
                reject(
                    new Error(
                        `Remote resource ${options.url} returned status code: ${response.statusCode}: ${body}`
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
function getAdminAccessToken() {
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
function getUserProfile(accessToken, userID) {
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

// Get user Google Photos album list
function getAlbums(accessToken) {
    const options = {
        method: 'GET',
        //url: `https://www.googleapis.com/gmail/v1/users/me/labels`,
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
    return requestObject(options)
}

// Create decorator that checks the JWT signature and specified fields
const jwtValidateDecorator = require('./azure-functions-auth0')({
    clientId: AUTH0_API_ID,
    clientSecret: AUTH0_API_SIGNING_CERTIFICATE,
    algorithms: ['RS256'],
    domain: `${AUTH0_DOMAIN_URL}/`
})

// The main Functions Function
module.exports = jwtValidateDecorator((context, req) => {
    if (req.user) {
        // Get a token to access the admin API
        context.log('Token Validated')

        getAdminAccessToken()
            .then(({ object: { access_token } }) => {
                context.log('got Admin Access Token')
                const userId = req.user.sub // has been added to the req by the decorator
                return getUserProfile(access_token, userId)
            })
            // Get the album list from google
            .then(({ object }) => {
                context.log('Obtained user profile')
                const google_access_token = object.identities[0].access_token // hidden from the Auth0 console
                return getAlbums(google_access_token)
            })
            // Get the album titles
            .then(({ object: { feed: { entry } } }) => {
                // FIXME handle no entry
                context.log('Got Album list')
                const titles = entry.map(ent => ent.title.$t)
                return {
                    status: 200,
                    body: JSON.stringify(titles),
                    headers: { 'Content-Type': 'application/json' }
                }
            })
            .catch(err => {
                return {
                    status: 400,
                    body: err.message
                }
            })
            .then(res => {
                context.log('all done')
                context.done(null, res)
            })
    } else {
        const res = {
            status: 400,
            body: 'Something is wrong with the Authorization token'
        }
        context.done(null, res)
    }
})
