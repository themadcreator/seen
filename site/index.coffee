express   = require 'express'
path      = require 'path'
marked    = require 'marked'
highlight = require 'highlight.js'
fs        = require 'fs'
demos     = require './demos'
markdowns = require './markdowns'

app = express()

app.configure ->
  # Setup templates
  app.engine('html', require('swig').renderFile)
  app.set('view engine', 'html')
  app.set('views', path.join(__dirname, 'views'))

  # Static routes
  app.use '/dist',       express.static(path.join(__dirname, '..', 'dist'))
  app.use '/docs/docco', express.static(path.join(__dirname, '..', 'docs', 'docco'))
  app.use '/assets',     express.static(path.join(__dirname, 'assets'))
  app.use '/lib',        express.static(path.join(__dirname, 'lib'))
  app.use '/css',        express.static(path.join(__dirname, 'css'))

  # Demo routes
  for demo, i in demos then do (demo, i) ->
    demo.prev = demos[i - 1]
    demo.next = demos[i + 1]
    app.get "/demo/#{demo.view}", (req, res) -> res.render demo.view, demo

  # Markdowned Routes
  renderer = new marked.Renderer()
  renderer.code = (code, lang, escaped) ->
    highlighted = highlight.highlight(lang, code).value
    return """<pre><code class="hljs #{lang}">#{highlighted}</code></pre>"""
  marked.setOptions(renderer : renderer)
  markdowns.forEach (markdown) ->
    app.use markdown.route, (req, res) ->
      fs.readFile path.join(__dirname, markdown.path), {encoding : 'UTF-8'}, (err, content) ->
        res.render('markdown-template',
          title    : markdown.title
          markdown : marked(content)
        )

  # Index route
  app.get '/', (req,res) -> res.render 'index', {demos}

# Launch
server = app.listen 5000, ->
  console.log('Listening on port %d', server.address().port)
