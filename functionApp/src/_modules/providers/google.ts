import { getProviderAccessToken } from './auth0'
import { requestObject } from '../_modules/httpUtils'
import { log } from '../_modules/logger'

interface GDataFeedEntry {
    title: { $t: string }
    id: { $t: string }
    gphoto$id: { $t: string }
    media$group: {
        media$content: { url: string; height: number; width: number }[]
        media$thumbnail: { url: string; height: number; width: number }[]
    }
}

interface GDataFeed {
    feed: {
        entry: GDataFeedEntry[]
    }
}

export interface AlbumEntry {
    title: string
    id: string
}
export interface PhotoEntry {
    url: string
    height: number
    width: number
}

export async function getPhotoAlbumList(userId: string): Promise<AlbumEntry[]> {
    const accessToken: string = await getProviderAccessToken(userId)
    const options = {
        method: 'GET',
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'GData-Version': '3'
        }
    }
    const { feed: { entry } } = await requestObject<GDataFeed>(options)
    return entry.map(
        (ent: GDataFeedEntry) =>
            <AlbumEntry>{ title: ent.title.$t, id: ent.gphoto$id.$t }
    )
}

export async function getPhotoAlbumContents(
    userId: string,
    albumId: string
): Promise<PhotoEntry[]> {
    const accessToken: string = await getProviderAccessToken(userId)
    const options = {
        method: 'GET',
        url: `https://picasaweb.google.com/data/feed/api/user/default/albumid/${albumId}?alt=json`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'GData-Version': '3'
        }
    }
    const { feed: { entry } } = await requestObject<GDataFeed>(options)
    //    log((await requestObject<GDataFeed>(options)).feed.entry[0])

    return entry.map((ent: GDataFeedEntry) => {
        const { media$group: { media$content: [{ url, height, width }] } } = ent

        return <PhotoEntry>{
            url,
            width,
            height
        }
    })
}
