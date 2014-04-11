## Getting started

Step 1. Create a web page including the seen library. Coffeescript is optional, but all the sample code (as well as the library source) is all coffeescript.

```html
  <html>
  <head>
    <script src="seen.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js"></script>
  </head>
  <body>

    <svg width="400" height="400" id="seen-canvas"></svg>
    <!-- OR -->
    <canvas width="400" height="400" id="seen-canvas"></canvas>

    <script type="text/coffeescript">
      SEE BELOW
    </script>

  </body>
  </html>
```

Step 2. Create a scene with a single shape and render it using a context.

```coffeescript
  # Create a shape
  shape = seen.Shapes.tetrahedron()

  # Create scene and add shape to model
  scene = new seen.Scene
    model    : seen.Models.default().add(shape)
    viewport : seen.Viewports.center(400, 400)

  # Create render context from canvas
  context = seen.Context('seen-canvas', scene)

  # Render it!
  context.render()
```

## Overview

If you've ever coded OpenGL, DirectX or used another 3D library, many of these primitives should already be familiar to you. All of the demo projects define primitives in roughly this order.

We define a `shape` as a set of planar `surface`s in 3D space. The shape also includes a `material`, containing color and surface properties, and a `painter`, which ultimately determines how to draw the geometry on screen.

You can instantiate a new shape like so:

```coffeescript
  # A predefined primitive
  shape = seen.Shapes.tetrahedron()

  # A custom shape
  shape = new seen.Shape('my shape', [new seen.Surface([
    seen.P(0,0,0)
    seen.P(0,1,0)
    seen.P(1,0,0)
  ])])
```

Shapes are contained within hieriarchical `model`s. Each model has its own transformation matrix and can contain shapes, lights, and other models. The lights in a model apply to shapes in that model and all the child models.

```coffeescript
  model = seen.Models.defaultModel() # Use this. It contains the default lights.
  model.add(shape)
```

Spawn a new child `model`s easily using `.append()`:

```coffeescript
  childModel = model.append()
  childModel.scale(5)
  childModel.add(seen.Shapes.sphere())
```

A `scene` is composed of a model, viewport, and a camera. The viewport and camera contain the projection transformations to take the shapes from object space to screen space.

```coffeescript
  scene = new seen.Scene(
      model    : model
      viewport : seen.Viewports.center(width, height)
      camera   : new seen.Camera
        projection : seen.Projections.perspective()
  )
```

The default projection is perspective. Defining the viewport width/height like the above will center the scene in the view and object space will map 1:1 with screen space in the z=0 plane.

Finally, a graphics `context` is defined to render the scene into SVG or HTML5 Canvas.

```coffeescript
  # Create an empty context then add the scene to it
  context = seen.Context('id-of-svg-or-canvas')
  context.sceneLayer(scene)
  context.render()

  # Create a context that contains the scene layer
  context = seen.Context('id-of-svg-or-canvas', scene)
  context.render()
```

You can add multiple `SceneLayers` to a single context or re-use a scene in multiple contexts. Or, use one shape, generate many angles with scenes, and render them all in different contexts.

## Render Contexts (SVG vs. Canvas)

Seen.js contains a simple abstraction on top of the graphics capabilities of SVG and HTML5 Canvas elements. All of the other components of this library are agnostic to the type of context it will be rendered in. However, there are some performance considerations.

Creating elements within SVG is generally much slower than drawing directly into an HTML5 Canvas. If you can get away with using a canvas, you will generally have much better performance.

Generating the path data for SVG elements means serializing many point values. Rounding the point values to the nearest pixel drastically increases performance on SVG renderers, but can introduce slight choppiness in the motion of an animated scene. If your scene doesn't look very smooth, try turning on `fractionalPoints` in the scene options.

## Render Loop Performance

Seen.js makes every effort to make rendering as performant as possible. We use a few strategies to accomplish this.

The transformation computation of hierarchical models are lazilly computed at render time. This allows you to transform hierarchical models without re-computing the transformations for every child model and shape.

The transformation and projection of surface points as well as the creation of surface normals are delayed until render time. Once computed, we cache the results in a `renderModel` and prevent re-computation. We use the cached renderModel if the transformations have not changed by the next render loop. The cache is stored on the scene and can be flushed with `.flush()`. Flushing the cache may be necessary if you are adding and removing many shapes from the model as there is no built-in eviction strategy for the cache.

Shapes are rendered using a painters algorithm in order to produce realistic occlusion (where one object appears in front of another). We simple sort the objects by their z coordinate in screen space then draw the shapes from back to front. The means that there is no partial occlusion.

We include backface culling to prevent drawing surfaces that are facing away from the camera. This can be turned off per surface or for the entire scene.

The default shader computes surface color using a phong shading model including ambient, diffuse, and specular terms. Since these calculations involve a fair bit of math, you can often get a very minor speedup by omitting the specular term. You can change the shader for each surface or you can set the scene's default shader.

## Transformables

`Shape`s, `light`s, `model`s, and `camera`s extend the `seen.Transformable` class. Transformations are applied using the standard affine transformations:

* `scale`
* `translate`
* `rotx`
* `roty`
* `rotz`
* `matrix` # Multiply by 4x4 matrix represented by an Array(16).
* `reset`  # Returns the transformation matrix to the identity matrix (or the baked-in matrix).
* `bake`   # Sets the matrix that a reset() will return to.

## Animation

Seen.js contains a looping, event-firing class for animating scenes. The render `context` contains a method `.animate()` which will create and return an animator that is set up to invoke the context's `.render()` method. To modify the scene on every frame, listen to the 'beforeRender' event.

Construct a new instance of `seen.Animator` to create more complex animations that might span multiple scenes or contexts.

## Interaction

Seen.js includes adapters for mouse rotation and mousewheel zooming. For best results, use a `quaternion` to create a rotation matrix from the x,y movement of the mouse. The zoom adapter directly returns a scale factor that can be applied to your scene's model.
