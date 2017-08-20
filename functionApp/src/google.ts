import { requestObject } from './auth0'

interface GooglePhotoAlbumTitle {
    title: { $t: string }
}

export interface GooglePhotoTitlesFeed {
    feed: { entry: GooglePhotoAlbumTitle[] }
}

// Get user Google Photos album list
export function getGooglePhotoAlbumList(
    accessToken: string
): Promise<string[]> {
    const options = {
        method: 'GET',
        //url: `https://www.googleapis.com/gmail/v1/users/me/labels`,
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
    return requestObject<GooglePhotoTitlesFeed>(
        options
    ).then(({ feed: { entry } }) => {
        return entry.map((ent: GooglePhotoAlbumTitle) => ent.title.$t)
    })
}
