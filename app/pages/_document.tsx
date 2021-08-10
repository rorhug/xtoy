import { Document, Html, DocumentHead, Main, BlitzScript /*DocumentContext*/ } from "blitz"

import { ColorModeScript, extendTheme, ThemeConfig } from "@chakra-ui/react"
// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
}
// 3. extend the theme
export const theme = extendTheme({
  config,
  fonts: { body: "Inter, system-ui, sans-serif", heading: "Inter, system-ui, sans-serif" },
  // colors: { green: { 200: "#1db054" } },
  letterSpacings: {
    // normal: "-0.05em",
  },
  styles: {
    global: {
      "html, body": {
        letterSpacing: "-0.05em",
      },
    },
  },
})

class MyDocument extends Document {
  // Obnly uncomment if you need to customize this behaviour
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
