import { requestObject, getProviderAccessToken } from './auth0'

interface PhotoAlbumTitle {
    title: { $t: string }
}

interface PhotoTitlesFeed {
    feed: { entry: PhotoAlbumTitle[] }
}

export async function getPhotoAlbumList(userId: string): Promise<string[]> {
    const accessToken: string = await getProviderAccessToken(userId)
    const options = {
        method: 'GET',
        //url: `https://www.googleapis.com/gmail/v1/users/me/labels`,
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
    const { feed: { entry } } = await requestObject<PhotoTitlesFeed>(options)
    return entry.map((ent: PhotoAlbumTitle) => ent.title.$t)
}
