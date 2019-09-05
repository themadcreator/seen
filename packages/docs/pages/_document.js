import { default as DefaultDocument } from 'next/document'
import { Head, Main, NextScript } from 'next/document'

export default class Document extends DefaultDocument {
    render() {
        return (
            <html>
                <Head>
                    <link rel="stylesheet" href="/_next/static/style.css" />
                    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Roboto" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
