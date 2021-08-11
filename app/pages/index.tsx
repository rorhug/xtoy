import {
  ArrowForwardIcon,
  ChatIcon,
  CopyIcon,
  ExternalLinkIcon,
  WarningIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons"
import { RasterImage } from "../core/components/Image"
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
  Skeleton,
  Stack,
  Image,
  StackDivider,
  Text,
  useColorMode,
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
  const { colorMode } = useColorMode()

  if (!links) {
    return (
      <Alert status="error" mb={5}>
        <WarningIcon /> &nbsp; Unable to find conversion for this track.
      </Alert>
    )
  }

  const availableServices = SERVICES.filter(
    (name) => links[name]?.url && links[name]?.url.length > 5
  )

  // const all = SERVICES.map((name) => links[name]?.url && [name, links[name]?.url]).filter(
  //   (url) => url
  // )

  // delete links.appleMusic

  return (
    <VStack width="100%" divider={<StackDivider />} spacing={2}>
      {availableServices.length > 0 && (
        <Service
          key="all"
          service="All"
          url={
            "• " +
            availableServices.map((name) => links[name]?.url).join("\n• ") +
            "\n\nuse https://XtoY.PRO 🔮"
          }
          nolink={true}
        >
          {/* <Box height="100%" width="100%" flexDirection="column"> */}
          <Text display="inline" fontWeight="semibold" fontSize="16px">
            All
          </Text>
          <Grid
            height="100%"
            width="100%"
            templateColumns="repeat(3, 1fr)"
            gap={1}
            justifyItems="center"
            alignItems="center"
            mt="0 !important"
          >
            {availableServices.map((name, i) => (
              <Image
                key={name}
                src={`/${name}.svg`}
                alt={`${name} logo`}
                filter={colorMode === "dark" ? "invert(100%)" : undefined}
                height={name === "youtube" ? "20px" : "24px"}
                display="inline"
                marginTop="4px"
                objectFit="contain"
                layout="fill"
                // ml={(i % 2 === 0 && "auto") || undefined}
                // mr={(i % 2 === 1 && "auto") || undefined}
              />
            ))}
          </Grid>

          {/* </Box> */}
        </Service>
      )}

      {SERVICES.filter((n) => !availableServices.includes(n)).map((serviceName) => {
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

const Service: React.FC<{ service: string; url?: string; nolink?: boolean }> = ({
  service,
  url,
  nolink,
  children,
}) => {
  const [copied, setCopied] = useState(false)
  const { colorMode } = useColorMode()

  return (
    <Box width="100%">
      <HStack paddingBottom={0} display="flex" width="100%" alignItems="stretch">
        <VStack
          textAlign="center"
          paddingTop={1}
          flex={1}
          // as="a"
          // href={url}
          // target="_blank"
          // rel="noreferrer"
        >
          {children ? (
            children
          ) : (
            <>
              <Image
                src={`/${service}.svg`}
                alt={`${service} logo`}
                filter={colorMode === "dark" ? "invert(100%)" : undefined}
                height="25px"
                display="inline"
                marginTop="4px"
              />

              <Text
                display="inline"
                marginTop="4px !important"
                fontWeight="semibold"
                fontSize="16px"
              >
                {SERVICE_NAMES[service] || service}
              </Text>
            </>
          )}
        </VStack>

        {url ? (
          <>
            {navigator.share && (
              <ServiceButton onClick={() => navigator.share({ text: url })} icon={ExternalLinkIcon}>
                Share
              </ServiceButton>
            )}

            <ServiceButton
              icon={ChatIcon}
              as="a"
              href={`sms:&body=${encodeURIComponent(url)}`} //whatsapp://send?text=
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
  const { colorMode } = useColorMode()
  const track = play.musicItem.spotifyBlob as unknown as SpotifyApi.TrackObjectFull

  return (
    <Box
      padding={0}
      // pt={(open && "2rem") || undefined}
      onClick={setOpen}
      {...{
        ...(!open && {
          _hover: { cursor: "pointer", background: colorMode === "dark" ? "gray.700" : "blue.100" },
        }),
      }}
    >
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(4, 1fr)" gap={2}>
        <GridItem colSpan={1} rowSpan={1}>
          <Image src={track.album.images[1]?.url} alt={`Album art for ${track.album.name}`} />
        </GridItem>
        <GridItem colSpan={3} rowSpan={1}>
          <Heading
            as="h2"
            fontSize={{ md: "4xl", sm: "2xl", base: "md" }}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {track.name}
          </Heading>
          <Text paddingBottom={4} color="gray.500" fontSize={{ md: "xl", sm: "lg", base: "sm" }}>
            {track.artists.map((a) => a.name).join(", ")}
          </Text>
        </GridItem>
      </Grid>

      {open && (
        <Box pb="2rem">
          <Suspense
            fallback={
              <Stack spacing={4} py={3}>
                <Skeleton height="64px" />
                {/* <Skeleton height="64px" />
                <Skeleton height="64px" /> */}
              </Stack>
            }
          >
            <VStack py={3}>
              <ConvertedTrack musicItem={play.musicItem} />
            </VStack>
          </Suspense>
        </Box>
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

      <HStack alignItems="center">
        <Text paddingBottom={1} paddingTop={6} fontSize="20px" color="gray.500" flex="1">
          History:
        </Text>
        <Text paddingBottom={1} paddingTop={6} fontSize="13px" color="gray.500">
          tap to share
        </Text>
      </HStack>

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
  const { colorMode } = useColorMode()
  const filter = colorMode === "dark" ? "invert(100%)" : undefined

  if (currentUser) {
    return <Feed />
  } else {
    return (
      <>
        <Grid templateColumns="repeat(3, 1fr)" gap={1} mt="4em">
          <Box w="100%" textAlign="right">
            <Image
              src={`/spotify.svg`}
              alt="spotify logo"
              filter={filter}
              height="85px"
              width="85px"
              marginTop="4px"
              display="inline"
              layout="fill"
            />
          </Box>
          <Box w="100%" textAlign="center">
            <ChevronRightIcon fontSize={100} />
          </Box>
          <Box w="100%" textAlign="left">
            <Image
              src={`/appleMusic.svg`}
              alt="apple logo"
              filter={filter}
              height="85px"
              width="85px"
              marginTop="4px"
              display="inline"
              objectFit="contain"
              layout="fill"
            />
          </Box>
        </Grid>

        <Text
          pt={4}
          fontSize="30px"
          letterSpacing="-0.06em"
          textAlign="center"
          fontWeight="bold"
          lineHeight=""
        >
          You know that friend who&apos;s on Apple Music?
        </Text>
        <Text pb={4} fontSize="20px" letterSpacing="-0.06em" textAlign="center" mb="2em">
          Quickly send them what you&apos;re playing{" "}
          <Text as="strong" letterSpacing="normal">
            right now
          </Text>
          .
        </Text>

        <Button
          colorScheme="gray"
          as="a"
          href="/api/auth/spotify"
          isFullWidth={true}
          size="lg"
          fontSize="1.5em"
          color="gray.300"
        >
          Log In using
          <Image
            src="/spotifylogo.svg"
            alt="Spotify"
            height={30}
            layout="fill"
            objectFit="cover"
            pl="0.3em"
          />
        </Button>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <div className="container">
      <main>
        <Suspense
          fallback={
            <Stack>
              <Skeleton height="120px"></Skeleton>
            </Stack>
          }
        >
          <Page />
        </Suspense>
      </main>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout>{page}</Layout>

export default Home
