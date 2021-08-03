import { Document, Html, DocumentHead, Main, BlitzScript /*DocumentContext*/ } from "blitz"

import { ColorModeScript, extendTheme, ThemeConfig } from "@chakra-ui/react"
// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
}
// 3. extend the theme
const theme = extendTheme({ config })

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }

  render() {
    return (
      <Html lang="en">
        <DocumentHead />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <BlitzScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
