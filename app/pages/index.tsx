import { Suspense, useState } from "react"
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
  Text,
  Image,
  VStack,
  HStack,
} from "@chakra-ui/react"
import { ExternalLinkIcon, ChatIcon, CopyIcon } from "@chakra-ui/icons"
import { MusicItem } from "db"
import { CopyToClipboard } from "react-copy-to-clipboard"

const ConvertedTrack = ({ musicItem }: { musicItem: MusicItem }) => {
  const item = useConvertedItem(musicItem)
  const [copied, setCopied] = useState(false)

  console.log(item)

  const appleUrl = (item.odesliResponse as any)?.linksByPlatform?.appleMusic?.url

  if (!appleUrl) return <p>No apple link...</p>
  // paddingBottom={5}
  return (
    <div>
      <HStack spacing={2} align="center" paddingBottom={5} wrap="wrap">
        <VStack textAlign="center">
          <Image
            src="/Apple_logo_black.svg"
            alt="apple logo"
            filter="invert(100%)"
            width="20px"
            display="inline"
          />
          <Text display="inline" marginTop="0 !important">
            Apple
          </Text>
        </VStack>

        {navigator.share && (
          <Button
            colorScheme="gray"
            variant="solid"
            onClick={() => navigator.share({ url: appleUrl })}
            flexDir="column"
            paddingX={2}
            paddingY={6}
            flexGrow={1}
          >
            <ExternalLinkIcon />
            Share
          </Button>
        )}

        <Button
          colorScheme="gray"
          flexDir="column"
          as="a"
          href={`sms:&body=${appleUrl}`}
          paddingX={3}
          paddingY={6}
          flexGrow={1}
        >
          <ChatIcon />
          <Text>Text</Text>
        </Button>
        <CopyToClipboard text={appleUrl} onCopy={() => setCopied(true)}>
          <Button
            colorScheme={copied ? "green" : "gray"}
            flexDir="column"
            paddingX={2}
            paddingY={6}
            flexGrow={1}
          >
            <CopyIcon />
            <Text>{copied ? "Copied" : "Copy"}</Text>
          </Button>
        </CopyToClipboard>
      </HStack>

      <a href={appleUrl} target="_blank" rel="noreferrer">
        <Code wordBreak="break-all" fontSize="11px">
          {appleUrl}
        </Code>
      </a>
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
    <Box borderWidth="1px" borderRadius="lg" padding={2}>
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
        <GridItem colSpan={2} rowSpan={1}>
          <Image src={track.album.images[0]?.url} alt={`Album art for ${track.album.name}`} />
        </GridItem>
        <GridItem colSpan={3} rowSpan={1}>
          <Heading as="h3" size="md">
            {track.name}
          </Heading>
          <Text paddingBottom={4}>{track.artists.map((a) => a.name).join(", ")}</Text>

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
        <Text paddingBottom={1} fontSize="13px">
          Now playing...
        </Text>
        <Track />

        <Box paddingTop={10}>
          <Button
            size="sm"
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
