import { Point } from "./geometry/point";
import { IMaterializeable, Material } from "./materials";
import { Colors } from "./color";
import { IPainter, Painters } from "./render/painters";
import { Util } from "./util";
import { Transformable } from "./transformable";

// ## Surfaces and Shapes
// ------------------

// A `Surface` is a defined as a planar object in 3D space. These paths don't
// necessarily need to be convex, but they should be non-degenerate. This
// library does not support shapes with holes.
export class Surface {
  // When 'false' this will override backface culling, which is useful if your
  // material is transparent. See comment in `seen.Scene`.
  public cullBackfaces   = true;

  // Fill and stroke may be `Material` objects, which define the color and
  // finish of the object and are rendered using the scene's shader.
  public fillMaterial    = new Material(Colors.gray());
  public strokeMaterial  = null;
  public dirty = false;

  public text: string;
  private id: string;

  constructor(
    public points: Point[],
    public painter: IPainter = Painters.path
  ) {
    // We store a unique id for every surface so we can look them up quickly
    // with the `renderModel` cache.
    this.id = Util.uniqueId("s");
  }

  public fill(fill: IMaterializeable) {
    this.fillMaterial = Material.create(fill);
    return this;
  }

  public stroke(stroke: IMaterializeable) {
    this.strokeMaterial = Material.create(stroke);
    return this;
  }
}

// A `Shape` contains a collection of surface. They may create a closed 3D
// shape, but not necessarily. For example, a cube is a closed shape, but a
// patch is not.
export class Shape extends Transformable {
  constructor(public type: string, public surfaces: Surface[]) {
    super();
  }

  // Visit each surface
  public eachSurface(callback: (surface: Surface, i: number) => void) {
    this.surfaces.forEach(callback);
    return this;
  }

  // Apply the supplied fill `Material` to each surface
  public fill(fill: IMaterializeable) {
    this.eachSurface(s => s.fill(fill));
    return this;
  }

  // Apply the supplied stroke `Material` to each surface
  public stroke(stroke: IMaterializeable) {
    this.eachSurface(s => s.stroke(stroke));
    return this;
  }
};
