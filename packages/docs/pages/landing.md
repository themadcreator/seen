import { Page }  from "../components/page.tsx"

import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { okaidia } from 'react-syntax-highlighter/styles/prism';

This is the landing of the seen.js site

<Page header="Header here">

These are the children of the page

MAybe *this* is markdowneD?

> blockquote??
> or
> somethign


```typescript

    export interface ICode {

    }

```


<SyntaxHighlighter language='typescript' style={okaidia}>{'export interface ICode { }'}</SyntaxHighlighter>

</Page>
