import React, { Suspense } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useConvertedItem, useCurrentUser, useUserPlays } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import {
  Box,
  Button,
  Code,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Text,
  Image,
  Stack,
} from "@chakra-ui/react"
import { PhoneIcon, AddIcon, WarningIcon, ExternalLinkIcon, ChatIcon } from "@chakra-ui/icons"
import { MusicItem } from "db"

const ShareButton = ({ url }: { url: string }) => {
  if (!navigator.share) return null

  return (
    <Button
      leftIcon={<ExternalLinkIcon />}
      colorScheme="gray"
      variant="solid"
      onClick={() => navigator.share({ url })}
    >
      Share
    </Button>
  )
}

const ConvertedTrack = ({ musicItem }: { musicItem: MusicItem }) => {
  const item = useConvertedItem(musicItem)

  console.log(item)

  const appleUrl = (item.odesliResponse as any)?.linksByPlatform?.appleMusic?.url

  if (!appleUrl) return <p>No apple link...</p>

  return (
    <div>
      <Stack direction="row" spacing={4} align="center">
        <ShareButton url={appleUrl} />
        <Button leftIcon={<ChatIcon />} colorScheme="gray" as="a" href={`sms:&body=${appleUrl}`}>
          Message
        </Button>
      </Stack>
    </div>
  )
}

// const Track = ({ track }: { track: SpotifyApi.TrackObjectFull }) => {
const Track = () => {
  const userPlays = useUserPlays()

  const play = userPlays.current

  if (!play) {
    return <p>nothing playing</p>
  }

  const track = play.musicItem.spotifyBlob as unknown as SpotifyApi.TrackObjectFull

  return (
    <Box borderWidth="1px" borderRadius="lg" padding={5}>
      <Text paddingBottom={2} fontSize="13px">
        Now playing...
      </Text>
      <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(3, 1fr)" gap={4}>
        <GridItem rowSpan={2} colSpan={1}>
          <Image src={track.album.images[0]?.url} alt={`Album art for ${track.album.name}`} />
        </GridItem>
        <GridItem colSpan={2}>
          <Heading as="h3" size="lg">
            {track.name}
          </Heading>
          <p>{track.artists.map((a) => a.name).join(",")}</p>
        </GridItem>
        <GridItem colSpan={2}>
          <Suspense fallback="Loading...">
            <ConvertedTrack musicItem={play.musicItem} />
          </Suspense>
        </GridItem>
      </Grid>
    </Box>
  )
}

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  // const currentlyPlaying =

  if (currentUser) {
    return (
      <>
        <Track />

        <Box paddingTop={10}>
          <Button
            size="xs"
            onClick={async () => {
              await logoutMutation()
            }}
          >
            Logout
          </Button>
        </Box>
      </>
    )
  } else {
    return (
      <>
        <Button colorScheme="green" as="a" href="/api/auth/spotify">
          Log In With Spotify
        </Button>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <div className="container">
      <main>
        <Suspense fallback="Loading...">
          <UserInfo />
        </Suspense>
      </main>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
