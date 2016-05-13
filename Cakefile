require 'coffee-script/register'

fs           = require 'fs'
_            = require 'lodash'
path         = require 'path'
UglifyJS     = require 'uglify-js'
CoffeeScript = require 'coffee-script'
packageJson  = require './package.json'

{execSync} = require 'child_process'
exec       = (cmd) -> execSync(cmd, (err) -> throw err if err)

DISTS = {
  'seen.js' : [
    'src/namespace.coffee'
    'src/util.coffee'
    'src/events.coffee'
    'src/matrix.coffee'
    'src/transformable.coffee'
    'src/point.coffee'
    'src/quaternion.coffee'
    'src/bounds.coffee'
    'src/color.coffee'
    'src/materials.coffee'
    'src/light.coffee'
    'src/shaders.coffee'
    'src/affine.coffee'
    'src/render/context.coffee'
    'src/render/painters.coffee'
    'src/render/model.coffee'
    'src/render/layers.coffee'
    'src/render/svg.coffee'
    'src/render/canvas.coffee'
    'src/interaction.coffee'
    'src/surface.coffee'
    'src/model.coffee'
    'src/animator.coffee'
    'src/shapes/primitives.coffee'
    'src/shapes/mocap.coffee'
    'src/shapes/obj.coffee'
    'src/camera.coffee'
    'src/scene.coffee'
    # Extensions
    'src/ext/simplex.coffee'
    'src/ext/bvh-parser.js'
  ]
}

MIN_LICENSE = "/** seen.js v#{packageJson.version} | themadcreator.github.io/seen | (c) Bill Dwyer | @license: Apache 2.0 */\n"

DIST      = path.join(__dirname, 'dist', packageJson.version)
SITE_DIST = path.join(__dirname, 'site-dist')

# =======
# TASKS
# =======

task 'build', 'Build and uglify seen', () ->

  # Prepare output path
  if not fs.existsSync(path.join(__dirname, 'dist')) then fs.mkdirSync(path.join(__dirname, 'dist'))
  if not fs.existsSync(DIST) then fs.mkdirSync(DIST)

  license = fs.readFileSync(path.join(__dirname, 'LICENSE.md'), 'utf-8')
  license = license.split('\n').join('\n# ')

  for javascript, sources of DISTS
    console.log  "Building #{javascript}..."

    # Concat all coffeescript together for Docco
    coffeeCode = sources
      .filter((source) -> /\.coffee$/.test(source))
      .map((source) -> fs.readFileSync(source, 'utf-8')).join('\n\n')
    coffeeCode = "\n\n# #{license}\n\n" + coffeeCode
    fs.writeFileSync path.join(DIST, javascript.replace(/\.js$/, '.coffee')), coffeeCode, {flags: 'w'}
    console.log '  Joined.'

    # Compile to javascript
    jsCode = CoffeeScript.compile coffeeCode, {bare : true}
    otherJsCode = _.chain(sources)
      .filter((source) -> /\.js$/.test(source))
      .map((source) -> fs.readFileSync(source, 'utf-8'))
      .map((source) -> source.replace(/(?:\/\*(?:[\s\S]*?)\*\/)/gm, '')) # strip comments
      .join('\n\n')
      .value()
    code = """
      #{MIN_LICENSE}
      (function(){
        #{jsCode}
        #{otherJsCode}
      })(this);
    """
    fs.writeFileSync path.join(DIST, javascript), code, {flags: 'w'}
    console.log '  Compiled.'

    # Uglify
    ugly = UglifyJS.minify path.join(DIST, javascript),
      outSourceMap : "#{javascript}.map"
      output       :
        comments : true
    fs.writeFileSync path.join(DIST, javascript.replace(/\.js$/,'.min.js')), ugly.code, {flags: 'w'}
    fs.writeFileSync path.join(DIST, "#{javascript}.map"), ugly.map, {flags: 'w'}
    console.log '  Minified.'

    latest = path.join(__dirname, 'dist', 'latest')
    exec("rm #{latest}; cp -r #{DIST} #{latest}")
    console.log '  Copied to Latest.'

task 'site', 'Build seen website', (options) ->
  console.log  "Building static site..."

  swig        = require 'swig'
  marked      = require 'marked'
  highlight   = require 'highlight.js'
  demos       = require './site/demos'
  markdowns   = require './site/markdowns'
  pageOptions = require './site/options'

  renderPage = (filename, view, opts) ->
    opts = _.defaults(opts, pageOptions)
    opts.version = packageJson.version
    page = swig.renderFile path.join(__dirname, 'site', 'views', "#{view}.html"), opts
    fs.writeFileSync(path.join(SITE_DIST, "#{filename}.html"), page)

  # Prepare output path
  exec("rm -rf #{SITE_DIST}")
  if not fs.existsSync(SITE_DIST) then fs.mkdirSync(SITE_DIST)

  # Copy static resources
  for resource in ['lib', 'css', 'assets', 'CNAME']
    exec("cp -rf site/#{resource} #{SITE_DIST}/#{resource}") # copy site resources
  exec("cp site/favicons/* #{SITE_DIST}/.") # copy favicons
  exec("cp dist/latest/seen.min.js #{SITE_DIST}/lib/.") # copy dist for demos
  exec("cp dist/latest/seen.js #{SITE_DIST}/lib/.") # copy dist for demos
  exec("cp -r dist #{SITE_DIST}/dist") # copy dist for download
  console.log '  Copied static resources'

  # Generate docco
  script        = path.join('node_modules' , '.bin', 'docco')
  doccoCss      = 'node_modules/docco/resources/classic/docco.css'
  doccoTemplate = 'site/docco-template.jst'
  exec("#{script} --output #{SITE_DIST}/docco --css #{doccoCss} --template #{doccoTemplate} dist/latest/seen.coffee")
  console.log '  Generated Docco'

  # Demo pages
  for demo, i in demos then do (demo, i) ->
    demo.prev = demos[i - 1]
    demo.next = demos[i + 1]
    renderPage(demo.view, demo.view, demo)
    console.log "  Rendered '#{demo.title}' demo"

  # Markdowned pages
  renderer = new marked.Renderer()
  renderer.code = (code, lang, escaped) ->
    highlighted = highlight.highlight(lang, code).value
    return """<pre><code class="hljs #{lang}">#{highlighted}</code></pre>"""
  marked.setOptions(renderer : renderer)
  markdowns.forEach (markdown) ->
    content = fs.readFileSync path.join(__dirname, 'site', markdown.path), {encoding : 'UTF-8'}
    renderPage(markdown.route, 'markdown-template',
      title    : markdown.title
      markdown : marked(content)
      scripts  : [pageOptions.cdns.highlightjs.script]
      styles   : pageOptions.styles.concat [pageOptions.cdns.highlightjs.style]
    )
    console.log "  Rendered '#{markdown.title}' markdown"

  # Index page
  renderPage 'index', 'index', {demos}
  console.log '  Rendered index'
