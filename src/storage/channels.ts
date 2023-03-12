import { Channel } from "../youtube";
import Airtable from 'airtable'
import { makePortions } from "../shared/utils/makePortions";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY as string
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID as string
const AIRTABLE_CHANNELS_TABLE = process.env.AIRTABLE_CHANNELS_TABLE as string

const thumbnailsBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const channelsTable = thumbnailsBase(AIRTABLE_CHANNELS_TABLE)

export const putChannels = async (channels: Channel[]) => {
  const allStoredChannels = await channelsTable.select({ fields: ['id'] }).all()
  const existingChannels = new Set(allStoredChannels.map(channel => channel.get('id') as string))
  const newChannels = channels.filter(({ id }) => !existingChannels.has(id))

  const portions = makePortions(newChannels, 10)
  await Promise.all(portions.map(portion => {
    const records = portion.map(({ id, name, url }) => ({
      fields: {
        id,
        name,
        url,
      }
    }))

    return channelsTable.create(records)
  }))
}