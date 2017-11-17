/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function() {
  const shape = new seen.Shape('tri', [new seen.Surface([
    seen.P(-1, -1, 0),
    seen.P( 1, -1, 0),
    seen.P( 0,  1, 0)
  ])]).scale(height * 0.2);
  shape.fill(new seen.Material(seen.Colors.gray()));


  //shape = seen.Shapes.sphere(2).scale(height * 0.4)
  //seen.Colors.randomSurfaces2(shape)


  const model = new seen.Model().add(shape);

  model.add(seen.Lights.directional({
    normal    : seen.P(-1, 1, 1).normalize(),
    color     : seen.Colors.hex('#FF0000'),
    intensity : 0.01
  })
  );

  model.add(seen.Lights.directional({
    normal    : seen.P(1, 1, -1).normalize(),
    color     : seen.Colors.hex('#0000FF'),
    intensity : 0.01
  })
  );

  const scene = new seen.Scene({
    model,
    viewport : seen.Viewports.center(width, height)
  });
  const context = seen.Context('seen-canvas', scene).render();
  const dragger = new seen.Drag('seen-canvas', {inertia : true});
  return dragger.on('drag.rotate', function(e) {
    shape.transform(seen.Quaternion.xyToTransform(...Array.from(e.offsetRelative || [])));
    return context.render();
  });
};
