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
          <Heading as="h1" fontSize={[70, 100]} flex="1">
            <Text fontSize="1em" display="inline">
              X
            </Text>
            <Text
              fontSize="0.6em"
              color="gray"
              as="span"
              fontWeight="light"
              letterSpacing="-0.9.em"
            >
              to
            </Text>
            <Text fontSize="1em" display="inline" marginLeft="-0.2em">
              Y
            </Text>
            <Text fontSize="0.6em" color="gray" as="span" fontWeight="light" marginLeft="-0.4em">
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
              {!isLoading && (
                <MenuList
                  onClick={async () => {
                    await logoutMutation()
                  }}
                >
                  <MenuItem>Logout</MenuItem>
                </MenuList>
              )}
            </Menu>
          )}

          {/* <Button
            size="sm"
            onClick={async () => {
              await logoutMutation()
            }}
          >
            Logout
          </Button> */}
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

        <Box as="footer" paddingTop={20}>
          Made by <a href="https://twitter.com/rorhug">@rorhug</a>
        </Box>
      </Container>
    </UserContext.Provider>
  )
}

export default Layout
