import {
    OAuthAdminToken,
    OAuthUserProfile,
    auth0ifyBrianAPI,
    getAdminAccessToken,
    getUserProfile
} from '../auth0'
import { getGooglePhotoAlbumList } from '../google'
import { Auth0FunctionRequest } from '../auth0ify'
import {
    HttpContext,
    IFunctionRequest,
    HttpStatusCodes
} from 'azure-functions-typescript'

async function doit(
    context: HttpContext,
    req: Auth0FunctionRequest
): Promise<void> {
    try {
        const { access_token: admin_access_token } = await getAdminAccessToken()
        context.log('got Admin Access Token')

        const userId = req.user.sub // has been added to the req by the decorator
        const { identities } = await getUserProfile(admin_access_token, userId)
        context.log('Obtained user profile')

        const google_access_token = identities[0].access_token // hidden from the Auth0 console
        const titles = await getGooglePhotoAlbumList(google_access_token)
        context.log(titles)

        const titlesText = JSON.stringify(titles)
        context.log('Got Album list')
        context.done(null, {
            status: 200,
            body: titlesText,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        context.done(null, {
            status: 400,
            body: err.message
        })
    }
}

const main = auth0ifyBrianAPI(['photos'], (context, req) => {
    return doit(context, req)
})

// required commonjs style export so runtime can find the function
export = main
