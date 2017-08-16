const auth0 = require('../auth0')


// Get user Google Photos album list
function getPhotoAlbums(accessToken) {
    const options = {
        method: 'GET',
        //url: `https://www.googleapis.com/gmail/v1/users/me/labels`,
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
    return auth0.requestObject(options)
}


// The main Functions Function
module.exports = auth0.auth0ifyBrianAPI(['photos'], (context, req) => {
    auth0.getAdminAccessToken()
    .then(({ object: { access_token } }) => {
        context.log('got Admin Access Token')
        const userId = req.user.sub // has been added to the req by the decorator
        return auth0.getUserProfile(access_token, userId)
    })
    // Get the album list from google
    .then(({ object }) => {
        context.log('Obtained user profile')
        const google_access_token = object.identities[0].access_token // hidden from the Auth0 console
        return getPhotoAlbums(google_access_token)
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
        context.done(null, res)
    })
})
