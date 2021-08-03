import { Ctx, NotFoundError } from "blitz"
import db from "db"

export default async function convertedItem(params: { musicItemId: number }, ctx: Ctx) {
  ctx.session.$authorize()

  let item = await db.musicItem.findFirst({ where: { id: params.musicItemId } })

  if (!item) {
    throw new NotFoundError()
  }

  if (!item.odesliResponse) {
    console.log(`Fetching fromo odesli ${item.spotifyId} ${item.id}`)

    const track = item.spotifyBlob as unknown as SpotifyApi.TrackObjectFull
    const odesli = await fetch(
      `https://api.song.link/v1-alpha.1/links?key=${process.env.ODESLI_KEY}&userCountry=US&url=${track.uri}`
    )
    const body = await odesli.json()

    item = await db.musicItem.update({ where: { id: item.id }, data: { odesliResponse: body } })
  }

  return item
}

// URI::HTTPS.build(
//   host: "api.song.link",
//   port: 443,
//   path: "/v1-alpha.1/links",
//   query: {
//     key: Rails.configuration.odesli_api_key,
//     userCountry: "US",
//     url: uri
//   }.to_query
// )

// const spotify = new SpotifyWebApi();
