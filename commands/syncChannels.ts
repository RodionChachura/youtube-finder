import { putChannels } from '../src/storage/channels'
import { getChannels } from '../src/youtube/getChannels'

const syncChannels = async () => {
  const channels = await getChannels()
  await putChannels(channels)
}

syncChannels()