import { useQuery } from "blitz"
import getCurrentUser from "app/users/queries/getCurrentUser"
import userPlays from "app/users/queries/userPlays"
import playHistory from "app/users/queries/playHistory"
import convertedItem from "app/users/queries/convertedItem"
import { MusicItem } from "db"

export const useCurrentUser = () => useQuery(getCurrentUser, null, { suspense: false })

export const useUserPlays = () => {
  const [res] = useQuery(userPlays, null, { staleTime: 1000 })
  return res
}

export const useConvertedItem = ({ musicItem }: { musicItem: MusicItem }) => {
  const [result] = useQuery(
    convertedItem,
    { musicItemId: musicItem.id, force: false },
    { staleTime: 1000, enabled: !musicItem.odesliResponse }
  )

  return musicItem.odesliResponse ? musicItem : result
}

export const usePlayHistory = (options: { enabled: boolean }) => {
  const [res] = useQuery(playHistory, null, {
    staleTime: 1000,
    ...options,
    // enabled: typeof window !== "undefined",
  })
  return res
}
