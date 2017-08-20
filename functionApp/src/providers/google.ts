import { requestObject, getProviderAccessToken } from './auth0'

interface FeedEntry {
    title: { $t: string }
    id: { $t: string }
    gphoto$id: { $t: string }
}

interface FeedEntries {
    feed: {
        entry: FeedEntry[]
    }
}

export interface AlbumEntry {
    title: string
    id: string
}
export interface PhotoEntry {
    title: string
    url: string
}

export async function getPhotoAlbumList(
    userId: string,
    context?: any
): Promise<AlbumEntry[]> {
    const accessToken: string = await getProviderAccessToken(userId)
    const options = {
        method: 'GET',
        url: 'https://picasaweb.google.com/data/feed/api/user/default?alt=json',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'GData-Version': '3'
        }
    }
    /*    context.log(
        JSON.stringify(
            (await requestObject<FeedEntries>(options)).feed.entry[0],
            undefined,
            4
        )
    )*/
    const { feed: { entry } } = await requestObject<FeedEntries>(options)
    return entry.map(
        (ent: FeedEntry) =>
            <AlbumEntry>{ title: ent.title.$t, id: ent.gphoto$id.$t }
    )
}

export async function getPhotoAlbumContents(
    userId: string,
    albumId: string,
    context?: any
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
    context.log(
        JSON.stringify(
            (await requestObject<FeedEntries>(options)).feed.entry[0],
            undefined,
            4
        )
    )
    const { feed: { entry } } = await requestObject<FeedEntries>(options)
    return entry.map(
        (ent: FeedEntry) => <PhotoEntry>{ title: ent.title.$t, url: ent.id.$t }
    )
}
