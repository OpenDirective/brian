import { auth0ifyBrianAPI } from '../_modules/providers//auth0'
import { getPhotoAlbumList } from '../_modules/providers/google'
import { setLogger } from '../_modules/logger'

export = auth0ifyBrianAPI(['photos'], async (context, req) => {
    try {
        setLogger(context.log)
        const userId = req.user.sub
        const albums = await getPhotoAlbumList(userId)
        context.done(null, {
            status: 200,
            body: albums,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        context.done(null, {
            status: 400,
            body: err.message
        })
    }
})
