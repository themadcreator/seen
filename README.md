# seen.js
### A 3D Javascript Library


## What's this all about?
seen.js is a library for rendering simple 3D models in Javascript. It performs 3D to 2D transformations in code and renders to either SVG or HTML5 Canvases for broad compatibility.


## Features
* Renders to HTML5 Canvas elements for speed, or to SVG paths for compatibility.
* Phong reflection model with ambient, diffuse, and specular terms.
* Perspective and orthographic projections.
* Pixel-for-pixel viewport alignment in the Z=0 plane for easy layout.
* Point, directional, and ambient light sources.
* Hierarchical models, lighting, and transformations.
* Simple, fast painters algorithm for Z-ordering.
* 3D Transformed text (when using orthographic projections).
* Interaction including quaternion based mouse rotations.
* Modular class structure for maximum readability and extensibility.
* No dependencies (except for jquery and d3 in some demos).


## Render Loop Optimizations
* Minimal object creation
* JIT hierarchical transformation multiplication


## Rendering Pipeline
3D model definition:
* Model -> Lights, Shape -> Surface -> Shader, Material, Points
Camera definition:
* Camera -> Projection, Viewport
Render event hierarchy:
* Context -> Renderer -> RenderLayer -> Painter


## Demos
Clone this repo and start the demo server on http://localhost:5000 like so:
  cd demos
  npm install
  cake build
  npm start


## Documentation

# Annotated source (via Docco) located here:

## Hello, World!


## Defining a scene

## Creating an SVG or HTML4 Canvas render context

## Rendering and animating a scene


## Transforming shapes

## Manipulating shapes with your mouse

## Modifying material properties

## Loading and parsing .obj 3D model files


## Using one shape in multiple scenes

## Using one scene in multiple contexts

## Adding mutliple scenes to one context

