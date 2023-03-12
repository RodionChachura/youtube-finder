import { millisecondsInHour } from 'date-fns';
import { google, youtube_v3 } from 'googleapis';
import { Channel } from '.';

const minSubscribers = 1000
const maxSubscribers = 20000
const minVideoCount = 10

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});


const searchForChannels = async (keyword: string) => {
  const { data } = await youtube.search.list({
    part: ['snippet'],
    type: ['video'],
    maxResults: 50,
    relevanceLanguage: 'en',
    regionCode: 'US',
    q: keyword
  });

  if (!data?.items) {
    throw new Error('No channels found')
  }

  const targets = data.items.filter(({ snippet }) => {
    if (!snippet?.publishedAt) return false

    const publishedAt = new Date(snippet.publishedAt)

    return (Date.now() - publishedAt.valueOf()) < millisecondsInHour * 24 * 30
  })

  return Array.from(new Set(targets.map(item => item.snippet?.channelId as string)))
}

const isTargetChannel = ({ statistics }: youtube_v3.Schema$Channel) => {
  if (!statistics) {
    throw new Error('No statistics found')
  }

  const count = Number(statistics.subscriberCount)
  if (count < minSubscribers || count > maxSubscribers) return false

  const videoCount = Number(statistics.videoCount)
  if (videoCount < minVideoCount) return false

  const viewCount = Number(statistics.viewCount)
  if (viewCount / videoCount < 100) return false

  return true
}

const getChannelUrl = (id: string) => `https://www.youtube.com/channel/${id}`

export const getChannels = async (): Promise<Channel[]> => {
  const ids = await searchForChannels('font-end')
  console.log(ids)

  const { data: { items: channels } } = await youtube.channels.list({
    id: ids,
    part: ['snippet', 'statistics'],
    maxResults: 50
  })

  console.log(channels)

  if (!channels) {
    throw new Error('No channels found')
  }

  const targetChannels = channels.filter(isTargetChannel)

  console.log(targetChannels)

  return targetChannels.map(({ id, snippet }) => ({
    id: id as string,
    url: getChannelUrl(id as string),
    name: snippet?.title as string
  }))
}
