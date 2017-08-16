// constants - should be in app settings not here
const AUTH0_DOMAIN_URL = 'https://odbrian.eu.auth0.com'
const AUTH0_API_ID = 'https://brianAPI'
const AUTH0_SIGNING_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJMmdlKJbhL/OQMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFG9kYnJpYW4uZXUuYXV0aDAuY29tMB4XDTE3MDczMTE5NTM0N1oXDTMxMDQw
OTE5NTM0N1owHzEdMBsGA1UEAxMUb2Ricmlhbi5ldS5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC6mEyHQeLP/nUk74fx0Ztz6acgSrEi
YVGsItJjv8jthjNRxhoO5PlIgwvZjXGgGr2OBiTeFmNMVHB+gtWLff+wNTXLJgKs
tKK7lEUOVQvcNFdvVlB60QZlFpa2D8pyrvJ8jQvc1hbc7Rt0G7+4je/BpkZe8m6D
d8Lt3pRBKI1N3HJWuepBzU7TTol0zmZbpANSnsQqkPkolrHfPXgxCjZnhyyac/QR
0ggvLz0dwOId6b2aQ0TFNQ8SRpRGRCabHoKRzzalSUrAT5sFIu6NWocGXs3ykx25
CHCKt0pLvIGIlDSxlp2e1jRIK3YT/Df2ZbALSz0UQIwJy4B+wqkBT76RAgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFB8jHZ2bIJk9BV1AVecTMOje
3O2NMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAqK2UUWWvjGLx
A2dNWrmlPKcBhsLvR/b1chteEMpKsbIPX56cRLxeU4O1ecjH0UceSGyV+gEOWGkl
tRfyjEPafiuActlSZU3E1d9/+EuAXqyrT0jp02gzR+WpUCdxe+hKv6o2AcOP5aY2
oNhZo7zn0RZhyeEYttuGG4bcnFLUWHLmJcxvdCiW2sO4FA+w6O2/OAl9Mj4d2M4t
55KhujAfqeAhAHt3TI+tHXgNVgrrx9YPrLKELyJbbllkvj8q3U7aY0u6ECh36ook
Zm79V3A1GVXg333qQBZ19gSFNzSMJ2Mad2TlBPjfTV7EpusdAF5TeNWQGOWL90px
Rx/U48BoDA==
-----END CERTIFICATE-----`
const AUTH0_ADMIN_CLIENT_ID = 'ipW0LTc7RcCatxlT1qmKhdmRqvHpmiNP'
const AUTH0_ADMIN_CLIENT_SECRET =
    'a-ohe97u3zxikvKhYFbksspoWFq1MX4_-94Am7kg8l2nQPr30GYvDzLnG7EN-RwD'
//const AZURE_APPINSIGHTS_KEY = 'bec7a79e-092e-4cb1-9217-b84cc23ff838'

//var appInsights = require('applicationinsights')
//var client = appInsights.getClient(AZURE_APPINSIGHTS_KEY)

const request = require('request')

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
            Authorization: `Bearer ${accessToken}`
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
    clientSecret: AUTH0_SIGNING_CERTIFICATE,
    algorithms: ['RS256'],
    domain: `${AUTH0_DOMAIN_URL}/`
})

// The main Functions Function
module.exports = jwtValidateDecorator((context, req) => {
    client.trackEvent('custom event', {
        customProperty: 'custom property value'
    })
    client.trackException(
        new Error('handled exceptions can be logged with this method')
    )
    client.trackMetric('custom metric', 3)
    client.trackTrace('trace message')
    var start = new Date()
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
