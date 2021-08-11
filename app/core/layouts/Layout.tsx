import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Image,
  Stack,
  Skeleton,
  useColorMode,
  Link,
  MenuDivider,
} from "@chakra-ui/react"
import { Head, useMutation } from "blitz"
import React, { createContext, ReactNode } from "react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { Global, css } from "@emotion/react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { User } from "db"

type LayoutProps = {
  title?: string
  children: ReactNode
}

export const UserContext = createContext<ReturnType<typeof useCurrentUser>[0]>(null)

const Layout = ({ title, children }: LayoutProps) => {
  const [currentUser, { isLoading }] = useCurrentUser()
  const [logoutMutation] = useMutation(logout)
  const { toggleColorMode } = useColorMode()

  const picture = (currentUser?.spotifyAccounts[0]?.cachedProfile as any)?.photos?.[0]?.value

  return (
    <UserContext.Provider value={currentUser}>
      <Head>
        <title>{title && title + " | "} XtoY.pro</title>
        <link rel="icon" href="/favicon.ico" />

        <style>
          {`
            @import url('https://rsms.me/inter/inter.css');
            html { font-family: 'Inter', sans-serif; }
            @supports (font-variation-settings: normal) {
              html { font-family: 'Inter var', sans-serif; }
            }
          `}
        </style>
      </Head>

      <Container maxW="container.md" p={2}>
        <Box display="flex" alignItems="center">
          <Heading as="h1" fontSize={[70, 100, 130]} flex="1" my={["-0.3em", "-0.2em", "0em"]}>
            <Text fontSize="1em" display="inline" letterSpacing="-0.0em">
              X
            </Text>
            <Text
              fontSize="0.6em"
              color="gray.500"
              as="span"
              fontWeight="light"
              letterSpacing="-0.1em"
            >
              to
            </Text>
            <Text fontSize="1em" display="inline" letterSpacing="-0.25em" ml="-0.15em">
              Y
            </Text>
            <Text
              fontSize="0.6em"
              color="gray.500"
              as="span"
              fontWeight="light"
              letterSpacing="-0.05em"
            >
              .pro
            </Text>
          </Heading>

          {currentUser && (
            <Menu placement="bottom-end">
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {picture && (
                  <Image
                    boxSize="2rem"
                    borderRadius="full"
                    src={picture}
                    alt="Profile picture"
                    mr="12px"
                    display="inline"
                  />
                )}
                {isLoading ? "loading..." : currentUser?.name}
              </MenuButton>

              <MenuList>
                <MenuItem
                  as="a"
                  href="https://twitter.com/rorhug"
                  target="_blank"
                  letterSpacing="normal"
                >
                  Follow @rorhug
                </MenuItem>
                <MenuItem onClick={toggleColorMode}>Toggle Light/Dark</MenuItem>
                <MenuDivider />
                {!isLoading && (
                  <MenuItem
                    onClick={async () => {
                      await logoutMutation()
                    }}
                  >
                    Logout
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </Box>

        <Box paddingTop={3}>
          {isLoading ? (
            <Stack>
              <Skeleton height="40px"></Skeleton>
            </Stack>
          ) : (
            children
          )}
        </Box>

        <Text as="footer" paddingY={50} fontSize="1.2em">
          Made by{" "}
          <Link
            href="https://twitter.com/rorhug"
            target="_blank"
            textDecoration="underline !important"
          >
            @rorhug
          </Link>
        </Text>
      </Container>
    </UserContext.Provider>
  )
}

export default Layout
