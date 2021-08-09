import { getRefreshedSpotify } from "app/core/spotifyApi"
import { ThenArg } from "app/core/util"
import { Ctx } from "blitz"
import db, { MusicType, TrackPlaySource } from "db"
import { pathToArray } from "zod"

export default async function playHistory(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const userId = ctx.session.userId

  const user = await db.user.findFirst({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, spotifyAccounts: true },
  })
  if (!user) throw new Error("no user")

  let spotifyAccount = user?.spotifyAccounts?.[0]
  if (!spotifyAccount) {
    throw new Error("no spotify account")
  }

  const spotify = await getRefreshedSpotify(spotifyAccount)

  console.log("Getting recently played...")
  const response = (await spotify.getMyRecentlyPlayedTracks()).body
  const items = response.items

  // get last play in db
  const lastPlay = await db.trackPlay.findFirst({
    include: { musicItem: true },
    orderBy: { playedAt: "desc" },
    where: { source: TrackPlaySource.HISTORY, userId: user.id },
  })

  const lastPlayedAt = lastPlay?.playedAt

  let histories: SpotifyApi.PlayHistoryObject[]
  if (lastPlayedAt) {
    const needle = items.findIndex((item) => new Date(item.played_at) <= lastPlayedAt)
    histories = needle === -1 ? items : items.slice(0, needle)
  } else {
    histories = items
  }

  console.log("adding", histories.map((h) => h.context).join("\n"))

  // const existingMusicItems = await db.musicItem.findMany({
  //   where: {
  //     kind: MusicType.TRACK,
  //     spotifyId: { in: histories.map((h) => h.track.id) },
  //   },
  // })

  // const existingMap = existingMusicItems.reduce((map, item) => {
  //   map[item.spotifyId] = item.id
  //   return map
  // }, {})

  for (const history of histories.reverse()) {
    // const musicItems = histories.map(async (history) => {

    console.log("asdf", history.context)
    const newPlay = await db.trackPlay.create({
      // include: { musicItem: true },
      data: {
        playedAt: history.played_at,
        source: TrackPlaySource.HISTORY,
        context: history.context as object,
        user: { connect: { id: user.id } },
        // musicItem: existingMap[history.track.id] ? { connectOrCreate } : {}
        musicItem: {
          connectOrCreate: {
            create: {
              spotifyId: history.track.id,
              spotifyBlob: history.track as object,
              kind: MusicType.TRACK,
            },
            where: { kind_spotifyId: { kind: MusicType.TRACK, spotifyId: history.track.id } },
          },
        },
      },
    })
  }
  // return newPlay
  // })

  return db.trackPlay.findMany({
    include: { musicItem: true },
    where: { userId: user.id, source: TrackPlaySource.HISTORY },
    orderBy: { playedAt: "desc" },
    take: 30,
  })
}
