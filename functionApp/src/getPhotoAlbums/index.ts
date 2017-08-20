import { auth0ifyBrianAPI } from '../providers//auth0'
import { getPhotoAlbumList } from '../providers/google'

export = auth0ifyBrianAPI(['photos'], async (context, req) => {
    try {
        const userId = req.user.sub
        const titles = await getPhotoAlbumList(userId)

        const titlesText = JSON.stringify(titles)
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
})
