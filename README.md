# seen.js
### A 3D Javascript Library


## What's this all about?
seen.js is a library for rendering simple 3D models in Javascript. It performs 3D to 2D transformations in code and renders to either SVG or HTML5 Canvases for broad compatibility.


## Features
* Renders to HTML5 Canvas elements for speed, or to SVG paths.
* Phong reflection model with ambient, diffuse, and specular terms
* Perspective and orthographic projections
* Pixel-for-pixel viewport alignment in the Z=0 plane for easy layout.
* Hierarchical models, lighting, and transformations
* Simple, fast painters algorithm for Z-ordering
* 3D Transformed text (when using orthographic projections)


## Render Loop Optimizations
* Minimal object creation
* JIT hierarchical transformation multiplication


## Rendering Pipeline
3D model definition:
* Model -> Lights, Shape -> Surface -> Shader, Material, Points
Camera definition:
* Camera -> Projection, Viewport
Render event hierarchy:
* Scene -> Canvas/Renderer -> RenderLayer -> Painter


## Demos
Clone this repo and start the demo server on localhost like so:
  cd demos
  npm install
  cake build
  npm start
