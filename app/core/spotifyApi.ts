import db, { SpotifyAccount } from "db"
import SpotifyWebApi from "spotify-web-api-node"

export async function getRefreshedSpotify(spotifyAccount: SpotifyAccount): Promise<SpotifyWebApi> {
  const { accessToken, refreshToken } = spotifyAccount
  let spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    accessToken,
    refreshToken,
  })

  const min = new Date(new Date().getTime() + 60 * 1000)
  if (spotifyAccount.accessExpiresAt < min || !accessToken) {
    console.log(`refreshing access token ${spotifyAccount.accessExpiresAt}`)

    // let refreshed: ThenArg<ReturnType<SpotifyWebApi["refreshAccessToken"]>>
    const refreshed = await spotify.refreshAccessToken()
    console.log(refreshed)

    spotifyAccount = await db.spotifyAccount.update({
      where: { id: spotifyAccount.id },
      // select: { id: true, userId: true, spotifyAccountId: true, refreshToken: true, createdAt: true,},
      data: {
        // refreshToken: refreshed.body.refresh_token || spotifyAccount.refreshToken,
        accessToken: refreshed.body.access_token,
        accessExpiresAt: new Date(new Date().getTime() + refreshed.body.expires_in * 1000),
      },
    })

    const { accessToken, refreshToken } = spotifyAccount
    spotify = new SpotifyWebApi({
      // clientId: process.env.SPOTIFY_CLIENT_ID,
      // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      accessToken,
      refreshToken,
    })
  }

  return spotify
}
