import { useQuery } from "blitz"
import getCurrentUser from "app/users/queries/getCurrentUser"
import userPlays from "app/users/queries/userPlays"
import convertedItem from "app/users/queries/convertedItem"
import { MusicItem } from "db"

export const useCurrentUser = () => {
  const [user] = useQuery(getCurrentUser, null)
  return user
}

export const useUserPlays = () => {
  const [res] = useQuery(userPlays, null, {
    staleTime: 3000,
    // enabled: typeof window !== "undefined",
  })
  return res
}

export const useConvertedItem = (musicItem: MusicItem) => {
  const [item] = useQuery(
    convertedItem,
    { musicItemId: musicItem.id },
    { staleTime: 3000, enabled: !musicItem.odesliResponse }
  )
  return item || musicItem
}
