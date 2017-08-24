import { auth0ifyBrianAPI } from '../_modules/providers//auth0'
import {
    getPhotoAlbumList,
    getPhotoAlbumContents
} from '../_modules/providers/google'
import { setLogger } from '../_modules/logger'

export = auth0ifyBrianAPI(['photos'], async (context, req) => {
    // if token not ok auth0ify` wil return 403
    context.done(null, {
        status: 200,
        body: { message: 'token is OK' },
        headers: { 'Content-Type': 'application/json' }
    })
})
