import {
  ArrowForwardIcon,
  ChatIcon,
  CopyIcon,
  ExternalLinkIcon,
  WarningIcon,
} from "@chakra-ui/icons"
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  ComponentWithAs,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconProps,
  Image,
  Skeleton,
  Stack,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useConvertedItem, usePlayHistory, useUserPlays } from "app/core/hooks/useCurrentUser"
import Layout, { UserContext } from "app/core/layouts/Layout"
import { BlitzPage } from "blitz"
import { MusicItem, TrackPlay } from "db"
import { Suspense, useContext, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"

const SERVICE_NAMES = { appleMusic: "Apple", spotify: "Spotify", youtube: "YouTube" }
const SERVICES = ["appleMusic", "spotify", "youtube"]

const ConvertedTrack = (props: { musicItem: MusicItem }) => {
  const item = useConvertedItem({ musicItem: props.musicItem })
  const links = (item?.odesliResponse as any)?.linksByPlatform //?.appleMusic?.url

  if (!links) {
    return (
      <Alert status="error" mb={5}>
        <WarningIcon /> &nbsp; Unable to find conversion for this track.
      </Alert>
    )
  }
  // delete links.appleMusic

  return (
    <VStack
      width="100%"
      divider={<StackDivider borderColor="gray.700" />}
      spacing={2}
      paddingBottom={6}
    >
      {SERVICES.map((serviceName) => {
        const url = links[serviceName]?.url

        return <Service key={serviceName} service={serviceName} url={url} />
      })}
    </VStack>
  )
}

const ServiceButton = ({
  icon: Icon,
  ...props
}: ButtonProps & { icon: ComponentWithAs<"svg", IconProps>; href?: string }) => (
  <Button
    colorScheme="gray"
    variant="solid"
    paddingX={0}
    paddingY={8}
    flexDir="column"
    flex={1}
    display="flex"
    marginLeft={0}
    {...props}
  >
    <Icon h={6} w={6} />
    {props.children}
  </Button>
)

const Service = ({ service, url }: { service: string; url?: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <Box width="100%">
      <HStack paddingBottom={0} display="flex" width="100%" alignItems="stretch">
        <VStack
          textAlign="center"
          paddingTop={1}
          flex={1}
          as="a"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={`/${service}.svg`}
            alt="apple logo"
            filter="invert(100%)"
            height="25px"
            display="inline"
            marginTop="4px"
          />
          <Text display="inline" marginTop="4px !important" fontWeight="semibold" fontSize="16px">
            {SERVICE_NAMES[service] || service}
          </Text>
        </VStack>

        {url ? (
          <>
            {(true || navigator.share) && (
              <ServiceButton onClick={() => navigator.share({ url })} icon={ExternalLinkIcon}>
                Share
              </ServiceButton>
            )}

            <ServiceButton
              icon={ChatIcon}
              as="a"
              href={`sms:&body=${url}`} //whatsapp://send?text=
            >
              <Text>Text</Text>
            </ServiceButton>
            <CopyToClipboard text={url} onCopy={() => setCopied(true)}>
              <ServiceButton colorScheme={copied ? "green" : "gray"} display="flex" icon={CopyIcon}>
                <Text>{copied ? "Copied" : "Copy"}</Text>
              </ServiceButton>
            </CopyToClipboard>
          </>
        ) : (
          <>
            <Box flex={3} marginRight={4}>
              <Text as="i">No link available...</Text>
            </Box>
          </>
        )}
      </HStack>
    </Box>
  )
}

// {false && copied && (
//   <a href={url} target="_blank" rel="noreferrer">
//     <Code wordBreak="break-all" fontSize="11px">
//       {url}
//     </Code>
//   </a>
// )}

const Play = ({
  open,
  setOpen,
  play,
}: {
  open: boolean
  setOpen: () => void
  play: TrackPlay & { musicItem: MusicItem }
}) => {
  const track = play.musicItem.spotifyBlob as unknown as SpotifyApi.TrackObjectFull

  return (
    <Box
      padding={0}
      onClick={setOpen}
      {...{ ...(!open && { _hover: { cursor: "pointer", background: "gray.700" } }) }}
    >
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(5, 1fr)" gap={2}>
        <GridItem colSpan={1} rowSpan={1}>
          <Image src={track.album.images[1]?.url} alt={`Album art for ${track.album.name}`} />
        </GridItem>
        <GridItem colSpan={4} rowSpan={1}>
          <Heading
            as="h2"
            fontSize={{ md: "4xl", sm: "2xl", base: "xl" }}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {track.name}
          </Heading>
          <Text paddingBottom={4} color="gray.500">
            {track.artists.map((a) => a.name).join(", ")}
          </Text>
        </GridItem>
      </Grid>

      {open && (
        <Suspense
          fallback={
            <Stack paddingY={2}>
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Stack>
          }
        >
          <VStack spacing={3} paddingTop={3}>
            <ConvertedTrack musicItem={play.musicItem} />
          </VStack>
        </Suspense>
      )}
    </Box>
  )
}

const Feed = () => {
  const userPlays = useUserPlays()
  const userHistory = usePlayHistory({ enabled: !!userPlays })
  const [openedId, setOpenedId] = useState<number>()

  const { current } = userPlays

  return (
    <>
      <Text paddingY={1} fontSize="20px" color="gray.500">
        {current ? "Now playing:" : "Nothing playing on spotify."}
      </Text>
      {current && (
        <Play play={current} open={openedId === undefined} setOpen={() => setOpenedId(undefined)} />
      )}

      <Text paddingBottom={1} paddingTop={6} fontSize="20px" color="gray.500">
        History:
      </Text>

      {userHistory?.map((play) => (
        <Play
          key={play.id}
          play={play}
          open={play.id === openedId}
          setOpen={() => setOpenedId(play.id)}
        />
      ))}
    </>
  )
}

const Page = () => {
  const currentUser = useContext(UserContext)

  if (currentUser) {
    return <Feed />
  } else {
    return (
      <>
        <Grid templateColumns="repeat(3, 1fr)" gap={1}>
          <Box w="100%" textAlign="right">
            <Image
              src={`/spotify.svg`}
              alt="apple logo"
              filter="invert(100%)"
              height="85px"
              marginTop="4px"
              display="inline"
            />
          </Box>
          <Box w="100%" textAlign="center">
            <ArrowForwardIcon fontSize={100} />
          </Box>
          <Box w="100%" textAlign="left">
            <Image
              src={`/appleMusic.svg`}
              alt="apple logo"
              filter="invert(100%)"
              height="85px"
              marginTop="4px"
              display="inline"
            />
          </Box>
        </Grid>
        <Text paddingY={10} fontSize="30px" letterSpacing="-0.06em" textAlign="center">
          Quickly send songs to Apple folk.
        </Text>
        <Button colorScheme="green" as="a" href="/api/auth/spotify" isFullWidth={true} size="lg">
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
          <Page />
        </Suspense>
      </main>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout>{page}</Layout>

export default Home
