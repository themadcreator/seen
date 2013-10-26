seen.demo ?= {}

seen.demo.stockData = (callback) ->
  url       = 'http://query.yahooapis.com/v1/public/yql'
  startDate = '2013-01-01'
  endDate   = '2013-03-01'
  query     = encodeURIComponent('select * from yahoo.finance.historicaldata where symbol in ("AAPL") and startDate = "' + startDate + '" and endDate = "' + endDate + '"')
  env       = encodeURIComponent('http://datatables.org/alltables.env')
  $.getJSON(url, "q=#{query}&env=#{env}&format=json", callback)


seen.demo.demoChart = () ->
  model = seen.Models.default()

  scene = new seen.Scene
    model         : model
    cullBackfaces : false
    camera        : new seen.Camera
      camera     : seen.Matrices.identity.roty(-0.7).rotz(0.1).rotx(0.7).translate(0,-80)
      projection : seen.Projections.ortho()

  datagroup = model.append()
  scaleX = d3.scale.linear()
  scaleY = d3.scale.linear()

  $.getJSON '/assets/data.json', (data) ->
    data = data.query.results.quote

    scaleY.domain(d3.extent(data, (d) -> d.Close))
    scaleY.range([0,200])

    scaleX.domain(d3.extent(data, (d) -> new Date(d.date).getTime()))
    scaleX.range([-200,200])

    pts = [
      new seen.Point(scaleX.range()[1], 0, 0)
      new seen.Point(scaleX.range()[0], 0, 0)
    ]

    data.reverse()
    for d in data
      pts.push new seen.Point(scaleX(new Date(d.date).getTime()), scaleY(d.Close), 0)

    area = seen.Shapes.extrude(pts, 20).translate(0,0,-20)
    area.eachSurface (s) ->
      s.fill = new seen.Material seen.Colors.hsl(0.6, 1, 0.5, 0.5)
    datagroup.add area

    fmt = d3.time.format('%b %e')
    for t in scaleX.ticks(6)
      x = scaleX(t)
      text = new seen.Shapes.text(fmt(new Date(t)))
      text.scale(-1, 1, 1).transform seen.Matrices.identity
        .rotz(Math.PI/2)
        .rotx(Math.PI/2)
        .translate(x - 3, 0, 5)
      text.eachSurface (s) ->
        s.anchor = 'end'
      datagroup.add text

      line = seen.Shapes.path [
        new seen.Point(x, 0, 60)
        new seen.Point(x, 0, 0)
      ]
      line.eachSurface (s) ->
        s.stroke          = new seen.Material seen.Colors.gray, shader : seen.Shaders.flat
        s.fill            = null
        s['stroke-width'] = 2
      datagroup.add line

    scene.render()



  return scene
