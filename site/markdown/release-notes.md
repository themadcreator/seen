### v0.1.2

+ Add flag to disable renderModel caching (not recommended)

+ Moving build dependencies to devDependencies in package.json

+ More documentation for Docco.

+ Git repository maintenance.

### v0.1.1

+ Removed default fill layer and change default create context method for simplicity and clarity.

+ Removed width/height requirement for creating contexts. Now width/height is only necessary to align viewport.

+ Updated tests to include both SVG and Canvas renderings

### v0.1.0 - *INITIAL RELEASE*

#### Features

+ Render 3D scenes into SVG or HTML5 Canvas elements.

+ Shape primivites :
 + tetrahedron
 + cube
 + sphere (sub-divided icosahedron)
 + patch (triangulated)
 + Wavefront .obj format parser

+ Perspective and orthographic projections. 1:1 pixel-aligned viewport in z=1 plane.

+ Hierarchically transformed and lit scene models.

+ Ambient, point, and directional light sources.

+ Phong ambient, diffuse and specular lighting model per surface.

+ Simple event-based animator.

+ Mouse drag and scroll adapters for mouse-look and mousewheel-zoom.

+ Scene layering and re-contextualization. Use multiple scenes in one context or use one scene in multiple contexts.

+ Customizeable shapes, painters, and shaders.

+ Performance: z-order painter's algorithm, backface culling, point rounding, rendermodel caching, lazy evaluation of tranformations.

+ No dependencies

#### Bug Fixes

+ n/a

