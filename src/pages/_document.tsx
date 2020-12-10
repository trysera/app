import Document, { Html, Head, Main, NextScript } from "next/document";
import { CssBaseline } from "@geist-ui/react";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const styles = CssBaseline.flush();

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {styles}
        </>
      ),
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <meta property="og:title" content="Sera" />
          <meta
            property="og:description"
            content="A secure & decentralised password manager, powered by Arweave."
          />
          <meta property="og:image" content="/og.png" />
          <meta property="twitter:card" content="summary_large_image" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
