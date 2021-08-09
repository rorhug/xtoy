import { getRefreshedSpotify } from "app/core/spotifyApi"
import { ThenArg } from "app/core/util"
import { Ctx } from "blitz"
import db, { MusicType, TrackPlaySource } from "db"

// import SpotifyWebApi from "spotify-web-api-node"

// type Track = {
//   track: ThenArg<ReturnType<SpotifyWebApi['getMyCurrentPlayingTrack']>>

// }

function isTrack(t: SpotifyApi.CurrentPlaybackResponse["item"]): t is SpotifyApi.TrackObjectFull {
  return t?.type === "track"
}

export default async function userPlays(_ = null, ctx: Ctx) {
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

  console.log("Getting current playing...")
  const response = (await spotify.getMyCurrentPlayingTrack()).body
  const item = response.item

  // if (response.currently_playing_type !== "track" || !isTrack(item)) return lastPlay

  const lastPlay = await db.trackPlay.findFirst({
    include: { musicItem: true },
    orderBy: { id: "desc" },
    where: { source: TrackPlaySource.PLAYER, userId: user.id },
  })

  if (
    response.currently_playing_type !== "track" ||
    !isTrack(item) ||
    (lastPlay?.musicItem.kind === MusicType.TRACK && lastPlay.musicItem.spotifyId === item.id)
  ) {
    return { current: lastPlay }
  }

  const musicItem = await db.musicItem.upsert({
    where: { kind_spotifyId: { kind: MusicType.TRACK, spotifyId: item.id } },
    // update: { spotifyBlob: item as object },
    update: {},
    create: { spotifyId: item.id, kind: MusicType.TRACK, spotifyBlob: item as object },
  })

  const newPlay = await db.trackPlay.create({
    data: {
      source: TrackPlaySource.PLAYER,
      musicItemId: musicItem.id,
      userId: user.id,
      context: response.context as object,
    },
  })

  return { current: { ...newPlay, musicItem } }
}
