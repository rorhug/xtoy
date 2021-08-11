import { chakra } from "@chakra-ui/react"
import { Image as NextImage } from "next/image"

export const RasterImage = chakra(NextImage, {
  baseStyle: { maxH: 120, maxW: 120 },
  shouldForwardProp: (prop) => ["width", "height", "src", "alt"].includes(prop),
})
