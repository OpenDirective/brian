import { auth0ifyBrianAPI } from '../providers//auth0'
import { getPhotoAlbumList, getPhotoAlbumContents } from '../providers/google'

export = auth0ifyBrianAPI(['photos'], async (context, req) => {
    try {
        const userId = req.user.sub
        const albums = await getPhotoAlbumList(userId, context)
        const photos = await getPhotoAlbumContents(
            userId,
            albums[0].id,
            context
        )
        const test = JSON.stringify(photos, undefined, 4)
        context.done(null, {
            status: 200,
            body: test,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        context.done(null, {
            status: 400,
            body: err.message
        })
    }
})
