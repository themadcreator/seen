(function() {
  var seen, _base;

  seen = (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen != null ? (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen : _base.seen = {};

  (function() {
    var ARRAY_CACHE, IDENTITY, Matrix, POINT_CACHE, Point, Points, Transformable;
    ARRAY_CACHE = new Array(16);
    IDENTITY = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    Matrix = (function() {
      function Matrix(m) {
        this.m = m != null ? m : null;
        if (this.m == null) {
          this.m = IDENTITY.slice();
        }
        return this;
      }

      Matrix.prototype.copy = function() {
        return new Matrix(this.m.slice());
      };

      Matrix.prototype.reset = function() {
        this.m = IDENTITY.slice();
        return this;
      };

      Matrix.prototype._multiplyM = function(m) {
        var c, i, j, _i, _j;
        c = ARRAY_CACHE;
        for (j = _i = 0; _i < 4; j = ++_i) {
          for (i = _j = 0; _j < 16; i = _j += 4) {
            c[i + j] = m[i] * this.m[j] + m[i + 1] * this.m[4 + j] + m[i + 2] * this.m[8 + j] + m[i + 3] * this.m[12 + j];
          }
        }
        ARRAY_CACHE = this.m;
        this.m = c;
        return this;
      };

      Matrix.prototype._rotx = function(theta) {
        var ct, rm, st;
        ct = Math.cos(theta);
        st = Math.sin(theta);
        rm = [1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1];
        return this._multiplyM(rm);
      };

      Matrix.prototype._roty = function(theta) {
        var ct, rm, st;
        ct = Math.cos(theta);
        st = Math.sin(theta);
        rm = [ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1];
        return this._multiplyM(rm);
      };

      Matrix.prototype._rotz = function(theta) {
        var ct, rm, st;
        ct = Math.cos(theta);
        st = Math.sin(theta);
        rm = [ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        return this._multiplyM(rm);
      };

      Matrix.prototype._translate = function(x, y, z) {
        if (x == null) {
          x = 0;
        }
        if (y == null) {
          y = 0;
        }
        if (z == null) {
          z = 0;
        }
        this.m[3] += x;
        this.m[7] += y;
        this.m[11] += z;
        return this;
      };

      Matrix.prototype._scale = function(sx, sy, sz) {
        if (sx == null) {
          sx = 1;
        }
        if (sy == null) {
          sy = sx;
        }
        if (sz == null) {
          sz = sy;
        }
        this.m[0] *= sx;
        this.m[5] *= sy;
        this.m[10] *= sz;
        return this;
      };

      Matrix.prototype.multiply = function(b) {
        return this.multiplyM(b.m);
      };

      Matrix.prototype.multiplyM = function(m) {
        return this.copy()._multiplyM(m);
      };

      Matrix.prototype.rotx = function(theta) {
        return this.copy()._rotx(theta);
      };

      Matrix.prototype.roty = function(theta) {
        return this.copy()._roty(theta);
      };

      Matrix.prototype.rotz = function(theta) {
        return this.copy()._rotz(theta);
      };

      Matrix.prototype.translate = function(x, y, z) {
        return this.copy()._translate(x, y, z);
      };

      Matrix.prototype.scale = function(sx, sy, sz) {
        return this.copy()._scale(sx, sy, sx);
      };

      return Matrix;

    })();
    seen.Matrices = {
      identity: new Matrix(),
      flipX: new Matrix()._scale(-1, 1, 1),
      flipY: new Matrix()._scale(1, -1, 1),
      flipZ: new Matrix()._scale(1, 1, -1)
    };
    Transformable = (function() {
      function Transformable() {
        this.m = new Matrix;
      }

      Transformable.prototype.scale = function(sx, sy, sz) {
        this.m._scale(sx, sy, sz);
        return this;
      };

      Transformable.prototype.translate = function(x, y, z) {
        this.m._translate(x, y, z);
        return this;
      };

      Transformable.prototype.rotx = function(theta) {
        this.m._rotx(theta);
        return this;
      };

      Transformable.prototype.roty = function(theta) {
        this.m._roty(theta);
        return this;
      };

      Transformable.prototype.rotz = function(theta) {
        this.m._rotz(theta);
        return this;
      };

      Transformable.prototype.matrix = function(m) {
        this.m._multiplyM(m);
        return this;
      };

      Transformable.prototype.transform = function(m) {
        this.m._multiply(m);
        return this;
      };

      Transformable.prototype.reset = function() {
        this.m.reset();
        return this;
      };

      return Transformable;

    })();
    Point = (function() {
      function Point(x, y, z, w) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
        this.z = z != null ? z : 0;
        this.w = w != null ? w : 1;
      }

      Point.prototype.transform = function(matrix) {
        var r;
        r = POINT_CACHE;
        r.x = this.x * matrix.m[0] + this.y * matrix.m[1] + this.z * matrix.m[2] + this.w * matrix.m[3];
        r.y = this.x * matrix.m[4] + this.y * matrix.m[5] + this.z * matrix.m[6] + this.w * matrix.m[7];
        r.z = this.x * matrix.m[8] + this.y * matrix.m[9] + this.z * matrix.m[10] + this.w * matrix.m[11];
        r.w = this.x * matrix.m[12] + this.y * matrix.m[13] + this.z * matrix.m[14] + this.w * matrix.m[15];
        this.set(r);
        return this;
      };

      Point.prototype.set = function(p) {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        this.w = p.w;
        return this;
      };

      Point.prototype.copy = function() {
        return new Point(this.x, this.y, this.z, this.w);
      };

      Point.prototype.normalize = function() {
        return this.copy()._normalize();
      };

      Point.prototype.add = function(q) {
        return this.copy()._add(q);
      };

      Point.prototype.subtract = function(q) {
        return this.copy()._subtract(q);
      };

      Point.prototype.multiply = function(q) {
        return this.copy()._multiply(q);
      };

      Point.prototype.divide = function(q) {
        return this.copy()._divide(q);
      };

      Point.prototype.cross = function(q) {
        return this.copy()._cross(q);
      };

      Point.prototype.dot = function(q) {
        return this.x * q.x + this.y * q.y + this.z * q.z;
      };

      Point.prototype._multiply = function(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
      };

      Point.prototype._divide = function(n) {
        this.x /= n;
        this.y /= n;
        this.z /= n;
        return this;
      };

      Point.prototype._normalize = function() {
        var n;
        n = Math.sqrt(this.dot(this));
        if (n === 0) {
          this.set(Points.Z);
        } else {
          this._divide(n);
        }
        return this;
      };

      Point.prototype._add = function(q) {
        this.x += q.x;
        this.y += q.y;
        this.z += q.z;
        return this;
      };

      Point.prototype._subtract = function(q) {
        this.x -= q.x;
        this.y -= q.y;
        this.z -= q.z;
        return this;
      };

      Point.prototype._cross = function(q) {
        var r;
        r = POINT_CACHE;
        r.x = this.y * q.z - this.z * q.y;
        r.y = this.z * q.x - this.x * q.z;
        r.z = this.x * q.y - this.y * q.x;
        this.set(r);
        return this;
      };

      Point.prototype.toJSON = function() {
        return [this.x, this.y, this.z, this.w];
      };

      return Point;

    })();
    Points = {
      X: new Point(1, 0, 0),
      Y: new Point(0, 1, 0),
      Z: new Point(0, 0, 1),
      EYE: new Point(0, 0, -1),
      ZERO: new Point(0, 0, 0)
    };
    POINT_CACHE = new Point();
    seen.Matrix = Matrix;
    seen.Point = Point;
    seen.Points = Points;
    return seen.Transformable = Transformable;
  })();

}).call(this);
(function() {
  var seen, _base,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  seen = (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen != null ? (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen : _base.seen = {};

  (function() {
    /*
    Once initialized, this class will have a constant memory footprint
    down to number primitives. Also, we compare each transform and projection
    to prevent unnecessary re-computation.
    */

    var Group, RenderSurface, Shape, Surface,
      _this = this;
    RenderSurface = (function() {
      function RenderSurface(points, transform, projection) {
        this.points = points;
        this.transform = transform;
        this.projection = projection;
        this.transformed = this._initTransformationSet();
        this.projected = this._initTransformationSet();
        this._update();
      }

      RenderSurface.prototype.update = function(transform, projection) {
        if (this._arraysEqual(transform.m, this.transform.m) && this._arraysEqual(projection.m, this.projection.m)) {

        } else {
          this.transform = transform;
          this.projection = projection;
          return this._update();
        }
      };

      RenderSurface.prototype._update = function() {
        this._math(this.transformed, this.points, this.transform, false);
        return this._math(this.projected, this.transformed.points, this.projection, true);
      };

      RenderSurface.prototype._arraysEqual = function(a, b) {
        var i, val, _i, _len;
        if (!a.length === b.length) {
          return false;
        }
        for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
          val = a[i];
          if (!(val === b[i])) {
            return false;
          }
        }
        return true;
      };

      RenderSurface.prototype._initTransformationSet = function() {
        var p;
        return {
          points: (function() {
            var _i, _len, _ref, _results;
            _ref = this.points;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              p = _ref[_i];
              _results.push(p.copy());
            }
            return _results;
          }).call(this),
          barycenter: new seen.Point(),
          normal: new seen.Point(),
          v0: new seen.Point(),
          v1: new seen.Point()
        };
      };

      RenderSurface.prototype._math = function(set, points, transform, applyClip) {
        var i, p, sp, _i, _j, _len, _len1, _ref;
        if (applyClip == null) {
          applyClip = false;
        }
        for (i = _i = 0, _len = points.length; _i < _len; i = ++_i) {
          p = points[i];
          sp = set.points[i];
          sp.set(p).transform(transform);
          if (applyClip) {
            sp._divide(sp.w);
          }
        }
        set.barycenter.set(seen.Points.ZERO);
        _ref = set.points;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          p = _ref[_j];
          set.barycenter._add(p);
        }
        set.barycenter._divide(set.points.length);
        set.v0.set(set.points[1])._subtract(set.points[0]);
        set.v1.set(set.points[points.length - 1])._subtract(set.points[0]);
        return set.normal.set(set.v0._cross(set.v1)._normalize());
      };

      return RenderSurface;

    })();
    seen.PathPainter = {
      paint: function(surface, render, canvas) {
        return canvas.path().path(render.projected.points).style({
          fill: render.fill == null ? 'none' : seen.Colors.toHexRgb(render.fill),
          stroke: render.stroke == null ? 'none' : seen.Colors.toHexRgb(render.stroke)
        });
      }
    };
    seen.TextPainter = {
      paint: function(surface, render, canvas) {
        return canvas.text().text(surface.text).transform(render.transform.multiply(render.projection)).style({
          fill: render.fill == null ? 'none' : seen.Colors.toHexRgb(render.fill),
          stroke: render.stroke == null ? 'none' : seen.Colors.toHexRgb(render.stroke)
        });
      }
    };
    Surface = (function() {
      Surface.prototype.ignoreBackfaceCulling = false;

      function Surface(points, painter) {
        this.points = points;
        this.painter = painter != null ? painter : seen.PathPainter;
        this.fill = seen.Colors.white;
      }

      Surface.prototype.getRenderSurface = function(transform, projection) {
        if (this.render == null) {
          this.render = new RenderSurface(this.points, transform, projection);
        } else {
          this.render.update(transform, projection);
        }
        return this.render;
      };

      return Surface;

    })();
    Shape = (function(_super) {
      __extends(Shape, _super);

      function Shape(type, surfaces) {
        this.type = type;
        this.surfaces = surfaces;
        this.toJSON = __bind(this.toJSON, this);
        Shape.__super__.constructor.call(this);
      }

      Shape.prototype.eachSurface = function(f) {
        this.surfaces.forEach(f);
        return this;
      };

      Shape.prototype.fill = function(fill) {
        this.eachSurface(function(s) {
          return s.fill = fill;
        });
        return this;
      };

      Shape.prototype.stroke = function(stroke) {
        this.eachSurface(function(s) {
          return s.stroke = stroke;
        });
        return this;
      };

      Shape.prototype.toJSON = function() {
        var p, surface;
        if (this.type === 'custom') {
          return {
            type: this.type,
            transforms: [['matrix', this.m.m]],
            surfaces: (function() {
              var _i, _len, _ref, _results;
              _ref = this.surfaces;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                surface = _ref[_i];
                _results.push((function() {
                  var _j, _len1, _ref1, _results1;
                  _ref1 = surface.points;
                  _results1 = [];
                  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    p = _ref1[_j];
                    _results1.push(p.toJSON());
                  }
                  return _results1;
                })());
              }
              return _results;
            }).call(this)
          };
        } else {
          return {
            type: this.type,
            transforms: [['matrix', this.m.m]]
          };
        }
      };

      return Shape;

    })(seen.Transformable);
    Group = (function(_super) {
      __extends(Group, _super);

      function Group() {
        Group.__super__.constructor.call(this);
        this.children = [];
      }

      Group.prototype.add = function(child) {
        this.children.push(child);
        return this;
      };

      Group.prototype.append = function() {
        var group;
        group = new Group;
        this.add(group);
        return group;
      };

      Group.prototype.eachShape = function(f) {
        var child, _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof Shape) {
            f.call(this, child);
          }
          if (child instanceof Group) {
            _results.push(child.eachTransformedShape(f));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Group.prototype.eachTransformedShape = function(f, m) {
        var child, _i, _len, _ref, _results;
        if (m == null) {
          m = null;
        }
        if (m == null) {
          m = this.m;
        }
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child instanceof Shape) {
            f.call(this, child, child.m.multiply(m));
          }
          if (child instanceof Group) {
            _results.push(child.eachTransformedShape(f, child.m.multiply(m)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      return Group;

    })(seen.Transformable);
    seen.Shapes = {
      _cubeCoordinateMap: [[0, 1, 3, 2], [5, 4, 6, 7], [1, 0, 4, 5], [2, 3, 7, 6], [3, 1, 5, 7], [0, 2, 6, 4]],
      _mapPointsToSurfaces: function(points, coordinateMap) {
        var c, coords, spts, surfaces, _i, _len;
        surfaces = [];
        for (_i = 0, _len = coordinateMap.length; _i < _len; _i++) {
          coords = coordinateMap[_i];
          spts = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = coords.length; _j < _len1; _j++) {
              c = coords[_j];
              _results.push(points[c].copy());
            }
            return _results;
          })();
          surfaces.push(new Surface(spts));
        }
        return surfaces;
      },
      joints: function(n, unitshape) {
        var g, i, joints, _i;
        if (unitshape == null) {
          unitshape = this.unitcube;
        }
        g = new Group;
        joints = [];
        for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
          joints.push(g);
          g = g.append().translate(-0.5, -1, -0.5).add(unitshape()).append().translate(0.5, 0, 0.5).append();
        }
        return joints;
      },
      bipedSkeleton: function(unitshape) {
        var attachSideJoint, makeArm, makeLeg, makeSkeleton, skeleton;
        if (unitshape == null) {
          unitshape = _this.unitcube;
        }
        makeSkeleton = function() {
          var joints;
          joints = _this.joints(3, unitshape);
          return {
            upperBody: joints[0],
            torso: joints[1],
            pelvis: joints[2]
          };
        };
        makeArm = function() {
          var joints;
          joints = _this.joints(4, unitshape);
          return {
            shoulder: joints[0],
            upperArm: joints[1],
            elbow: joints[2],
            foreArm: joints[3]
          };
        };
        makeLeg = function() {
          var joints;
          joints = _this.joints(4, unitshape);
          return {
            upperLeg: joints[0],
            knee: joints[1],
            lowerLeg: joints[2],
            foot: joints[3]
          };
        };
        attachSideJoint = function(rootjoint, joint, x) {
          var s;
          s = rootjoint.append().translate(x).append();
          s.append().translate(x).add(joint);
          return s;
        };
        skeleton = makeSkeleton();
        skeleton.root = skeleton.upperBody;
        skeleton.leftArm = makeArm();
        skeleton.rightArm = makeArm();
        skeleton.leftLeg = makeLeg();
        skeleton.rightLeg = makeLeg();
        skeleton.leftShoulder = attachSideJoint(skeleton.upperBody, skeleton.leftArm.shoulder, 0.5);
        skeleton.rightShoulder = attachSideJoint(skeleton.upperBody, skeleton.rightArm.shoulder, -0.5);
        skeleton.leftHip = attachSideJoint(skeleton.pelvis, skeleton.leftLeg.upperLeg, 0.5);
        skeleton.rightHip = attachSideJoint(skeleton.pelvis, skeleton.rightLeg.upperLeg, -0.5);
        return skeleton;
      },
      cube: function() {
        var points;
        points = [new seen.Point(-1, -1, -1), new seen.Point(-1, -1, 1), new seen.Point(-1, 1, -1), new seen.Point(-1, 1, 1), new seen.Point(1, -1, -1), new seen.Point(1, -1, 1), new seen.Point(1, 1, -1), new seen.Point(1, 1, 1)];
        return new Shape('cube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
      },
      unitcube: function() {
        var points;
        points = [new seen.Point(0, 0, 0), new seen.Point(0, 0, 1), new seen.Point(0, 1, 0), new seen.Point(0, 1, 1), new seen.Point(1, 0, 0), new seen.Point(1, 0, 1), new seen.Point(1, 1, 0), new seen.Point(1, 1, 1)];
        return new Shape('unitcube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
      },
      rectangle: function(point1, point2) {
        var compose, points;
        compose = function(x, y, z) {
          return new seen.Point(x(point1.x, point2.x), y(point1.y, point2.y), z(point1.z, point2.z));
        };
        points = [compose(Math.min, Math.min, Math.min), compose(Math.min, Math.min, Math.max), compose(Math.min, Math.max, Math.min), compose(Math.min, Math.max, Math.max), compose(Math.max, Math.min, Math.min), compose(Math.max, Math.min, Math.max), compose(Math.max, Math.max, Math.min), compose(Math.max, Math.max, Math.max)];
        return new Shape('rect', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
      },
      tetrahedron: function() {
        var coordinateMap, points;
        points = [new seen.Point(1, 1, 1), new seen.Point(-1, -1, 1), new seen.Point(-1, 1, -1), new seen.Point(1, -1, -1)];
        coordinateMap = [[0, 2, 1], [0, 1, 3], [3, 2, 0], [1, 2, 3]];
        return new Shape('tetrahedron', seen.Shapes._mapPointsToSurfaces(points, coordinateMap));
      },
      text: function(text) {
        var surface;
        surface = new Surface([new seen.Point(0, 0, -1), new seen.Point(0, 20, -1), new seen.Point(20, 0, -1)], seen.TextPainter);
        surface.text = text;
        surface.ignoreBackfaceCulling = true;
        return new Shape('text', [surface]);
      },
      custom: function(s) {
        var f, p, surfaces, _i, _len, _ref;
        surfaces = [];
        _ref = s.surfaces;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          surfaces.push(new Surface((function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = f.length; _j < _len1; _j++) {
              p = f[_j];
              _results.push((function(func, args, ctor) {
                ctor.prototype = func.prototype;
                var child = new ctor, result = func.apply(child, args);
                return Object(result) === result ? result : child;
              })(seen.Point, p, function(){}));
            }
            return _results;
          })()));
        }
        return new Shape('custom', surfaces);
      },
      fromJSON: function(s) {
        var shape, xform, _i, _len, _ref, _ref1;
        shape = this[s.type](s);
        _ref = s.transforms;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          xform = _ref[_i];
          (_ref1 = shape[xform[0]]).call.apply(_ref1, [shape].concat(__slice.call(xform.slice(1))));
        }
        return shape;
      }
    };
    seen.RenderSurface = RenderSurface;
    seen.Group = Group;
    seen.Surface = Surface;
    return seen.Shape = Shape;
  })();

}).call(this);
(function() {
  var seen, _base;

  seen = (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen != null ? (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen : _base.seen = {};

  seen.Projections = {
    perspectiveFov: function(fovyInDegrees, front) {
      var tan;
      if (fovyInDegrees == null) {
        fovyInDegrees = 50;
      }
      if (front == null) {
        front = 100;
      }
      tan = front * Math.tan(fovyInDegrees * Math.PI / 360.0);
      return seen.Projections.perspective(-tan, tan, -tan, tan, front, 2 * front);
    },
    orthoExtent: function(extent) {
      if (extent == null) {
        extent = 100;
      }
      return seen.Projections.ortho(-extent, extent, -extent, extent, extent, 2 * extent);
    },
    perspective: function(left, right, bottom, top, near, far) {
      var dx, dy, dz, m, near2;
      near2 = 2 * near;
      dx = right - left;
      dy = top - bottom;
      dz = far - near;
      m = new Array(16);
      m[0] = near2 / dx;
      m[1] = 0.0;
      m[2] = (right + left) / dx;
      m[3] = 0.0;
      m[4] = 0.0;
      m[5] = near2 / dy;
      m[6] = (top + bottom) / dy;
      m[7] = 0.0;
      m[8] = 0.0;
      m[9] = 0.0;
      m[10] = -(far + near) / dz;
      m[11] = -(far * near2) / dz;
      m[12] = 0.0;
      m[13] = 0.0;
      m[14] = -1.0;
      m[15] = 0.0;
      return new seen.Matrix(m);
    },
    ortho: function(left, right, bottom, top, near, far) {
      var dx, dy, dz, m, near2;
      near2 = 2 * near;
      dx = right - left;
      dy = top - bottom;
      dz = far - near;
      m = new Array(16);
      m[0] = 2 / dx;
      m[1] = 0.0;
      m[2] = 0.0;
      m[3] = (right + left) / dx;
      m[4] = 0.0;
      m[5] = 2 / dy;
      m[6] = 0.0;
      m[7] = -(top + bottom) / dy;
      m[8] = 0.0;
      m[9] = 0.0;
      m[10] = -2 / dz;
      m[11] = -(far + near) / dz;
      m[12] = 0.0;
      m[13] = 0.0;
      m[14] = 0.0;
      m[15] = 1.0;
      return new seen.Matrix(m);
    }
  };

  seen.Viewports = {
    centerOrigin: function(width, height, x, y) {
      if (width == null) {
        width = 500;
      }
      if (height == null) {
        height = 500;
      }
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      return new seen.Matrix().scale(width / 2, -height / 2).translate(x + width / 2, y + height / 2);
    }
  };

}).call(this);
(function() {
  var seen, _base,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  seen = (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen != null ? (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen : _base.seen = {};

  (function() {
    var Color, Colors, Light, Phong;
    Color = (function() {
      function Color(r, g, b, a) {
        this.r = r != null ? r : 0;
        this.g = g != null ? g : 0;
        this.b = b != null ? b : 0;
        this.a = a != null ? a : 0xFF;
      }

      Color.prototype.toJSON = function() {
        return seen.Colors.toHexRgb(this);
      };

      Color.prototype.toHexRgb = function() {
        return seen.Colors.toHexRgb(this);
      };

      Color.prototype.toStyle = function() {
        return seen.Colors.toStyle(this);
      };

      return Color;

    })();
    Colors = (function() {
      function Colors() {
        this.defaultFill = this.fromHsl(0.7, 1.0, 0.5);
        this.defaultStroke = null;
        this.black = new Color(0, 0, 0);
        this.white = new Color(0xFF, 0xFF, 0xFF);
      }

      Colors.prototype.fromRgb = function(r, g, b) {
        return new Color(r, g, b);
      };

      Colors.prototype.fromHex = function(hex) {
        if (hex.charAt(0) === '#') {
          hex = hex.substring(1);
        }
        return new Color(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16));
      };

      Colors.prototype.fromHsl = function(h, s, l) {
        var b, g, hue2rgb, p, q, r;
        r = g = b = 0;
        if (s === 0) {
          r = g = b = l;
        } else {
          hue2rgb = function(p, q, t) {
            if (t < 0) {
              t += 1;
            } else if (t > 1) {
              t -= 1;
            }
            if (t < 1 / 6) {
              return p + (q - p) * 6 * t;
            } else if (t < 1 / 2) {
              return q;
            } else if (t < 2 / 3) {
              return p + (q - p) * (2 / 3 - t) * 6;
            } else {
              return p;
            }
          };
          q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }
        return new Color(r * 255, g * 255, b * 255);
      };

      Colors.prototype.toHexRgb = function(color) {
        var c;
        c = (color.r << 16 | color.g << 8 | color.b).toString(16);
        while (c.length < 6) {
          c = "0" + c;
        }
        return "#" + c;
      };

      Colors.prototype.toStyle = function(color) {
        return "rgba({0},{1},{2},{3})".format(color.r, color.g, color.b, color.a);
      };

      return Colors;

    })();
    Light = (function(_super) {
      __extends(Light, _super);

      function Light(opts) {
        this.transform = __bind(this.transform, this);
        seen.Util.defaults(this, opts, {
          point: new seen.Point,
          color: seen.Colors.white,
          intensity: 0.01,
          exponent: 8
        });
      }

      Light.prototype.transform = function(m) {
        return this.point.transform(m);
      };

      return Light;

    })(seen.Transformable);
    Phong = (function() {
      function Phong() {
        this.getFaceColor = __bind(this.getFaceColor, this);
      }

      Phong.prototype.getFaceColor = function(lights, surface, color) {
        var Lm, Rm, c, dot, light, specular, _i, _j, _len, _len1, _ref, _ref1;
        c = new Color();
        _ref = lights.points;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          light = _ref[_i];
          Lm = light.point.subtract(surface.barycenter).normalize();
          dot = Lm.dot(surface.normal);
          if (dot > 0) {
            c.r += light.color.r * dot * light.intensity;
            c.g += light.color.g * dot * light.intensity;
            c.b += light.color.b * dot * light.intensity;
            Rm = surface.normal.multiply(dot * 2).subtract(Lm);
            specular = Math.pow(1 + Rm.dot(seen.Points.Z), light.exponent);
            c.r += specular * light.intensity;
            c.g += specular * light.intensity;
            c.b += specular * light.intensity;
          }
        }
        _ref1 = lights.ambients;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          light = _ref1[_j];
          c.r += light.color.r * light.intensity;
          c.g += light.color.g * light.intensity;
          c.b += light.color.b * light.intensity;
        }
        c.r = Math.min(0xFF, color.r * c.r);
        c.g = Math.min(0xFF, color.g * c.g);
        c.b = Math.min(0xFF, color.b * c.b);
        return c;
      };

      return Phong;

    })();
    seen.Color = Color;
    seen.Colors = new Colors;
    seen.Light = Light;
    seen.Shaders = {};
    return seen.Shaders.Phong = Phong;
  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function() {
    var SvgIterativeRenderer, _line, _svg, _svgRaw;
    _svg = function(name) {
      return $(_svgRaw(name));
    };
    _svgRaw = function(name) {
      return document.createElementNS('http://www.w3.org/2000/svg', name);
    };
    _line = d3.svg.line().x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    SvgIterativeRenderer = (function() {
      function SvgIterativeRenderer(g) {
        this.g = g;
        this._i = 0;
        this._g = this.g[0];
      }

      SvgIterativeRenderer.prototype.hideUnused = function() {
        var children, _results;
        children = this._g.childNodes;
        _results = [];
        while (this._i < children.length) {
          children[this._i].setAttribute('style', 'display: none;');
          _results.push(this._i++);
        }
        return _results;
      };

      SvgIterativeRenderer.prototype.path = function() {
        var el;
        el = this._manifest('path');
        return {
          el: el,
          path: function(points) {
            el.setAttribute('d', _line(points));
            return this;
          },
          style: function(style) {
            el.setAttribute('style', "fill: " + style.fill + "; stroke: " + style.stroke + ";");
            return this;
          }
        };
      };

      SvgIterativeRenderer.prototype.text = function() {
        var el;
        el = this._manifest('text');
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('font-family', 'Roboto');
        return {
          el: el,
          text: function(text) {
            el.textContent = text;
            return this;
          },
          style: function(style) {
            el.setAttribute('style', "fill: " + style.fill + "; stroke: " + style.stroke + ";");
            return this;
          },
          transform: function(transform) {
            var m;
            m = transform.m;
            el.setAttribute('transform', "matrix(" + m[0] + " " + m[4] + " " + m[1] + " " + m[5] + " " + m[3] + " " + m[7] + ")");
            return this;
          }
        };
      };

      SvgIterativeRenderer.prototype._manifest = function(type) {
        var children, current, path;
        children = this._g.childNodes;
        if (this._i >= children.length) {
          path = _svgRaw(type);
          this._g.appendChild(path);
          this._i++;
          return path;
        }
        current = children[this._i];
        if (current.tagName === type) {
          this._i++;
          return current;
        } else {
          path = _svgRaw(type);
          this._g.replaceChild(path, current);
          this._i++;
          return path;
        }
      };

      return SvgIterativeRenderer;

    })();
    seen.SvgCanvas = (function() {
      SvgCanvas.prototype.width = 500;

      SvgCanvas.prototype.height = 500;

      function SvgCanvas(svg) {
        this.svg = svg;
        this.render = __bind(this.render, this);
        this.layers = {
          background: _svg('g').addClass('background').appendTo(this.svg),
          scene: _svg('g').addClass('scene').appendTo(this.svg),
          overlay: _svg('g').addClass('overlay').appendTo(this.svg)
        };
      }

      SvgCanvas.prototype.add = function(component) {
        if (typeof component.addTo === "function") {
          component.addTo(this);
        }
        return this;
      };

      SvgCanvas.prototype.render = function(surfaces) {
        var renderer, surface, _i, _len;
        renderer = new SvgIterativeRenderer(this.layers.scene);
        for (_i = 0, _len = surfaces.length; _i < _len; _i++) {
          surface = surfaces[_i];
          surface.painter.paint(surface, surface.render, renderer);
        }
        renderer.hideUnused();
      };

      return SvgCanvas;

    })();
    seen.SvgRenderDebug = (function() {
      function SvgRenderDebug(scene) {
        this._renderEnd = __bind(this._renderEnd, this);
        this._renderStart = __bind(this._renderStart, this);
        this._text = _svg('text').css('text-anchor', 'end').attr('y', 20);
        this._fps = 30;
        scene.on('beforeRender.debug', this._renderStart);
        scene.on('afterRender.debug', this._renderEnd);
      }

      SvgRenderDebug.prototype.addTo = function(canvas) {
        return this._text.attr('x', canvas.width - 10).appendTo(canvas.layers.overlay);
      };

      SvgRenderDebug.prototype._renderStart = function() {
        return this._renderStartTime = new Date();
      };

      SvgRenderDebug.prototype._renderEnd = function(e) {
        var frameTime;
        frameTime = 1000 / (new Date() - this._renderStartTime);
        if (frameTime !== NaN) {
          this._fps += (frameTime - this._fps) / 20;
        }
        return this._text.text("fps: " + (this._fps.toFixed(1)) + " surfaces: " + e.surfaces.length);
      };

      return SvgRenderDebug;

    })();
    return seen.SvgFillRect = (function() {
      function SvgFillRect() {}

      SvgFillRect.prototype.addTo = function(canvas) {
        return _svg('rect').css('fill', '#EEE').attr({
          width: canvas.width,
          height: canvas.height
        }).appendTo(canvas.layers.background);
      };

      return SvgFillRect;

    })();
  })();

}).call(this);
(function() {
  var seen, _base,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  seen = (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen != null ? (_base = typeof exports !== "undefined" && exports !== null ? exports : this).seen : _base.seen = {};

  seen.Util = {
    defaults: function(obj, opts, defaults) {
      var prop, _results;
      for (prop in opts) {
        if (obj[prop] == null) {
          obj[prop] = opts[prop];
        }
      }
      _results = [];
      for (prop in defaults) {
        if (obj[prop] == null) {
          _results.push(obj[prop] = defaults[prop]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  seen.Scene = (function() {
    Scene.prototype.defaults = {
      cullBackfaces: true,
      projection: seen.Projections.perspective(-100, 100, -100, 100, 100, 300),
      viewport: seen.Viewports.centerOrigin(500, 500)
    };

    function Scene(options) {
      this.renderSurfaces = __bind(this.renderSurfaces, this);
      this.render = __bind(this.render, this);
      seen.Util.defaults(this, options, this.defaults);
      this.dispatch = d3.dispatch('beforeRender', 'afterRender');
      d3.rebind(this, this.dispatch, ['on']);
      this.group = new seen.Group();
      this.shader = new seen.Shaders.Phong();
      this.lights = {
        points: [],
        ambients: []
      };
    }

    Scene.prototype.startRenderLoop = function(msecDelay) {
      if (msecDelay == null) {
        msecDelay = 30;
      }
      return setInterval(this.render, msecDelay);
    };

    Scene.prototype.render = function() {
      var surfaces;
      this.dispatch.beforeRender();
      surfaces = this.renderSurfaces();
      this.canvas.render(surfaces);
      this.dispatch.afterRender({
        surfaces: surfaces
      });
      return this;
    };

    Scene.prototype.renderSurfaces = function(view) {
      var projection,
        _this = this;
      if (view == null) {
        view = null;
      }
      projection = view == null ? this.projection : view.multiply(this.projection);
      projection = projection.multiply(this.viewport);
      this.surfaces = [];
      this.group.eachTransformedShape(function(shape, transform) {
        var render, surface, _i, _len, _ref, _results;
        _ref = shape.surfaces;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          surface = _ref[_i];
          render = surface.getRenderSurface(transform, projection);
          if (!_this.cullBackfaces || surface.ignoreBackfaceCulling || render.projected.normal.z < 0) {
            if (surface.fill != null) {
              render.fill = _this.shader.getFaceColor(_this.lights, render.transformed, surface.fill);
            }
            if (surface.stroke != null) {
              render.stroke = surface.stroke;
            }
            _results.push(_this.surfaces.push(surface));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      this.surfaces.sort(function(a, b) {
        return b.render.projected.barycenter.z - a.render.projected.barycenter.z;
      });
      return this.surfaces;
    };

    return Scene;

  })();

}).call(this);
