import { Container, Heading, VStack, Box, Text } from "@chakra-ui/react"
import { Head } from "blitz"
import { ReactNode } from "react"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "xtoy"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxW="container.sm" p={4}>
        <Heading as="h1">
          Spotify
          <Text fontSize="20px" color="gray" as="span" fontWeight="light">
            to
          </Text>
          Apple
          <Text fontSize="20px" color="gray" as="span" fontWeight="light">
            .xyz
          </Text>
        </Heading>

        <Box paddingTop={7}>{children}</Box>

        <Box as="footer" paddingTop={20}>
          Made by <a href="https://twitter.com/rorhug">@rorhug</a>
        </Box>
      </Container>
    </>
  )
}

export default Layout
