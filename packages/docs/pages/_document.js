import { default as DefaultDocument } from 'next/document'
import { Head, Main, NextScript } from 'next/document'

export default class Document extends DefaultDocument {
    render() {
        return (
            <html>
                <Head>
                    <link rel="stylesheet" href="/_next/static/style.css" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
