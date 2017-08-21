import { auth0ifyBrianAPI } from '../_providers//auth0'
import { getPhotoAlbumList, getPhotoAlbumContents } from '../_providers/google'
import { setLogger } from '../_modules/logger'

export = auth0ifyBrianAPI(['photos'], async (context, req) => {
    try {
        setLogger(context.log)
        const userId = req.user.sub
        const albums = await getPhotoAlbumList(userId)
        const photos = await getPhotoAlbumContents(userId, albums[0].id)
        context.done(null, {
            status: 200,
            body: photos,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        context.done(null, {
            status: 400,
            body: err.message
        })
    }
})
