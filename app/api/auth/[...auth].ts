// app/api/auth/[...auth].ts
import { passportAuth } from "blitz"
import db from "db"

import { Strategy as SpotifyStrategy } from "passport-spotify"

const SPOTIFY_SCOPES = [
  "user-read-email",
  // "user-read-private",
  "user-read-currently-playing",
  "user-read-recently-played",
]
export default passportAuth({
  successRedirectUrl: "/",
  errorRedirectUrl: "/",

  // secureProxy: true,
  strategies: [
    {
      strategy: new SpotifyStrategy(
        {
          clientID: process.env.SPOTIFY_CLIENT_ID as string,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
          scope: SPOTIFY_SCOPES,
          /*...*/
          callbackURL:
            process.env.NODE_ENV === "production"
              ? "https://spotifytoapple.xyz/api/auth/spotify/callback"
              : "http://localhost:3000/api/auth/spotify/callback",
          includeEmail: true,
        },
        // async function (_token, _tokenSecret, profile, done) {
        async function (accessToken, refreshToken, expiresIn, profile, done) {
          const email = profile.emails && profile.emails[0]?.value

          if (!email) {
            // This can happen if you haven't enabled email access in your spotify app permissions
            return done(new Error("Spotify OAuth response doesn't have email."))
          }

          delete profile._raw

          const accessExpiresAt = expiresIn && new Date(new Date().getTime() + expiresIn * 1000)

          const spotifyAccount = await db.spotifyAccount.findFirst({
            where: {
              spotifyAccountId: profile.id,
            },
          })

          let user
          if (spotifyAccount === null) {
            user = await db.user.upsert({
              where: { email },
              create: {
                email,
                name: profile.displayName,

                spotifyAccounts: {
                  create: [
                    {
                      spotifyAccountId: profile.id,
                      accessToken,
                      refreshToken,
                      accessExpiresAt,
                      cachedProfile: profile,
                      scopes: SPOTIFY_SCOPES,
                    },
                  ],
                },
              },
              update: { email },
            })
          } else {
            const data =
              accessToken && refreshToken && accessExpiresAt
                ? {
                    accessToken,
                    refreshToken,
                    accessExpiresAt,
                    cachedProfile: profile,
                    scopes: SPOTIFY_SCOPES,
                  }
                : {
                    cachedProfile: profile,
                  }
            await db.spotifyAccount.update({
              where: { id: spotifyAccount.id },
              data,
            })
            user = await db.user.findFirst({ where: { id: spotifyAccount.userId } })
          }

          // console.log({
          //   accessToken: accessToken,
          //   refreshToken: refreshToken,
          //   expires_in: expires_in,
          //   profile: profile,
          // })

          const publicData = {
            userId: user.id,
            roles: [user.role],
            source: "spotify",
          }
          done(undefined, { publicData })
        }
      ), // Provide initialized passport strategy here
    },
  ],
})

// BQBel2aCc2bsNdA9HpJXlv3eWCR_CrY_OIg92RUlGxNbocALWrc6cYFIOT1cHHD7oJi4DTyxmq7pTmV2aINjx8IjD2hNDr5-ua4gI63ozsdt0ig8ls5bjIV56Z516wYTApP-cKJmBjF5b-j4-eX6SBySlZRi5XQHE_U AQCl2ZvtWIEGl5Ktl401nBeQ4hID26JjR85XtsCzrrn6my9MoVG807cg80CulYd3YmThJJH_vIfw6LFp_EcVlAEBVC2Dyf2mImPD3WNuvTQbC88S9irCU0UASZpcu-MFqjA

// {
//   provider: 'spotify',
//   id: 'rory_hughes',
//   username: 'rory_hughes',
//   displayName: 'Rory',
//   profileUrl: 'https://open.spotify.com/user/rory_hughes',
//   photos: [
//     {
//       value: 'https://i.scdn.co/image/ab6775700000ee85aca10410ce29ab4ef0340eb2'
//     }
//   ],
//   country: 'IE',
//   followers: 31,
//   product: 'premium',
//   _raw: '{\n' +
//     '  "country" : "IE",\n' +
//     '  "display_name" : "Rory",\n' +
//     '  "email" : "rory@rory.ie",\n' +
//     '  "explicit_content" : {\n' +
//     '    "filter_enabled" : false,\n' +
//     '    "filter_locked" : false\n' +
//     '  },\n' +
//     '  "external_urls" : {\n' +
//     '    "spotify" : "https://open.spotify.com/user/rory_hughes"\n' +
//     '  },\n' +
//     '  "followers" : {\n' +
//     '    "href" : null,\n' +
//     '    "total" : 31\n' +
//     '  },\n' +
//     '  "href" : "https://api.spotify.com/v1/users/rory_hughes",\n' +
//     '  "id" : "rory_hughes",\n' +
//     '  "images" : [ {\n' +
//     '    "height" : null,\n' +
//     '    "url" : "https://i.scdn.co/image/ab6775700000ee85aca10410ce29ab4ef0340eb2",\n' +
//     '    "width" : null\n' +
//     '  } ],\n' +
//     '  "product" : "premium",\n' +
//     '  "type" : "user",\n' +
//     '  "uri" : "spotify:user:rory_hughes"\n' +
//     '}',
//   _json: {
//     country: 'IE',
//     display_name: 'Rory',
//     email: 'rory@rory.ie',
//     explicit_content: { filter_enabled: false, filter_locked: false },
//     external_urls: { spotify: 'https://open.spotify.com/user/rory_hughes' },
//     followers: { href: null, total: 31 },
//     href: 'https://api.spotify.com/v1/users/rory_hughes',
//     id: 'rory_hughes',
//     images: [ [Object] ],
//     product: 'premium',
//     type: 'user',
//     uri: 'spotify:user:rory_hughes'
//   },
//   emails: [ { value: 'rory@rory.ie', type: null } ]
// } [Function: verified]
