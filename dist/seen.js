(function() {
  var ARRAY_POOL, Ambient, DiffusePhong, Flat, IDENTITY, NEXT_UNIQUE_ID, POINT_POOL, PathPainter, Phong, TextPainter, seen, _line, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _svg,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    _this = this;

  seen = (typeof exports !== "undefined" && exports !== null ? exports : this).seen = {};

  NEXT_UNIQUE_ID = 1;

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
    },
    arraysEqual: function(a, b) {
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
    },
    uniqueId: function() {
      return NEXT_UNIQUE_ID++;
    }
  };

  ARRAY_POOL = new Array(16);

  IDENTITY = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];

  seen.Matrix = (function() {
    function Matrix(m) {
      this.m = m != null ? m : null;
      if (this.m == null) {
        this.m = IDENTITY.slice();
      }
      return this;
    }

    Matrix.prototype.copy = function() {
      return new seen.Matrix(this.m.slice());
    };

    Matrix.prototype.reset = function() {
      this.m = IDENTITY.slice();
      return this;
    };

    Matrix.prototype.multiply = function(b) {
      return this.copy()._multiply(b);
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

    Matrix.prototype._multiply = function(b) {
      return this._multiplyM(b.m);
    };

    Matrix.prototype._multiplyM = function(m) {
      var c, i, j, _i, _j;
      c = ARRAY_POOL;
      for (j = _i = 0; _i < 4; j = ++_i) {
        for (i = _j = 0; _j < 16; i = _j += 4) {
          c[i + j] = m[i] * this.m[j] + m[i + 1] * this.m[4 + j] + m[i + 2] * this.m[8 + j] + m[i + 3] * this.m[12 + j];
        }
      }
      ARRAY_POOL = this.m;
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

    return Matrix;

  })();

  seen.M = function(m) {
    return new seen.Matrix(m);
  };

  seen.Matrices = {
    identity: seen.M(),
    flipX: seen.M().scale(-1, 1, 1),
    flipY: seen.M().scale(1, -1, 1),
    flipZ: seen.M().scale(1, 1, -1)
  };

  seen.Transformable = (function() {
    function Transformable() {
      this.m = new seen.Matrix();
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

  seen.Point = (function() {
    function Point(x, y, z, w) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
      this.w = w != null ? w : 1;
    }

    Point.prototype.transform = function(matrix) {
      var r;
      r = POINT_POOL;
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

    Point.prototype.cross = function(q) {
      return this.copy()._cross(q);
    };

    Point.prototype.dot = function(q) {
      return this.x * q.x + this.y * q.y + this.z * q.z;
    };

    Point.prototype.multiply = function(n) {
      return this.copy()._multiply(n);
    };

    Point.prototype.divide = function(n) {
      return this.copy()._divide(n);
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
      r = POINT_POOL;
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

  seen.P = function(x, y, z, w) {
    return new seen.Point(x, y, z, w);
  };

  POINT_POOL = seen.P();

  seen.Points = {
    X: seen.P(1, 0, 0),
    Y: seen.P(0, 1, 0),
    Z: seen.P(0, 0, 1),
    ZERO: seen.P(0, 0, 0)
  };

  seen.Color = (function() {
    function Color(r, g, b, a) {
      this.r = r != null ? r : 0;
      this.g = g != null ? g : 0;
      this.b = b != null ? b : 0;
      this.a = a != null ? a : 0xFF;
    }

    Color.prototype.copy = function() {
      return new seen.Color(this.r, this.g, this.b, this.a);
    };

    Color.prototype.scale = function(n) {
      return this.copy()._scale(n);
    };

    Color.prototype.offset = function(n) {
      return this.copy()._offset(c);
    };

    Color.prototype.clamp = function(min, max) {
      return this.copy()._clamp(min, max);
    };

    Color.prototype.addChannels = function(c) {
      return this.copy()._addChannels(c);
    };

    Color.prototype.multiplyChannels = function(c) {
      return this.copy()._multiplyChannels(c);
    };

    Color.prototype._scale = function(n) {
      this.r *= n;
      this.g *= n;
      this.b *= n;
      return this;
    };

    Color.prototype._offset = function(n) {
      this.r += n;
      this.g += n;
      this.b += n;
      return this;
    };

    Color.prototype._clamp = function(min, max) {
      if (min == null) {
        min = 0;
      }
      if (max == null) {
        max = 0xFF;
      }
      this.r = Math.min(max, Math.max(min, this.r));
      this.g = Math.min(max, Math.max(min, this.g));
      this.b = Math.min(max, Math.max(min, this.b));
      return this;
    };

    Color.prototype._addChannels = function(c) {
      this.r += c.r;
      this.g += c.g;
      this.b += c.b;
      return this;
    };

    Color.prototype._multiplyChannels = function(c) {
      this.r *= c.r;
      this.g *= c.g;
      this.b *= c.b;
      return this;
    };

    Color.prototype.hex = function() {
      var c;
      c = (this.r << 16 | this.g << 8 | this.b).toString(16);
      while (c.length < 6) {
        c = '0' + c;
      }
      return '#' + c;
    };

    Color.prototype.style = function() {
      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    };

    return Color;

  })();

  seen.Colors = {
    rgb: function(r, g, b, a) {
      return new seen.Color(r, g, b, a);
    },
    hex: function(hex) {
      if (hex.charAt(0) === '#') {
        hex = hex.substring(1);
      }
      return new seen.Color(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16));
    },
    hsl: function(h, s, l) {
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
      return new seen.Color(r * 255, g * 255, b * 255);
    }
  };

  seen.C = seen.Colors;

  seen.C.black = seen.C.hex('#000000');

  seen.C.white = seen.C.hex('#FFFFFF');

  seen.C.gray = seen.C.hex('#888888');

  seen.Material = (function() {
    Material.prototype.defaults = {
      color: seen.C.gray,
      metallic: false,
      specularColor: seen.C.white,
      specularExponent: 8,
      shader: null
    };

    function Material(color) {
      this.color = color;
      seen.Util.defaults(this, {}, this.defaults);
    }

    Material.prototype.render = function(lights, shader, renderData) {
      var renderShader, _ref;
      renderShader = (_ref = this.shader) != null ? _ref : shader;
      return renderShader.shade(lights, renderData, this);
    };

    return Material;

  })();

  seen.Light = (function(_super) {
    __extends(Light, _super);

    Light.prototype.defaults = {
      point: seen.P(),
      color: seen.C.white,
      intensity: 0.01,
      normal: seen.P(1, -1, -1).normalize()
    };

    function Light(opts) {
      this.transform = __bind(this.transform, this);
      seen.Util.defaults(this, opts, this.defaults);
    }

    Light.prototype.render = function() {
      return this.colorIntensity = this.color.scale(this.intensity);
    };

    Light.prototype.transform = function(m) {
      return this.point.transform(m);
    };

    return Light;

  })(seen.Transformable);

  seen.Shader = (function() {
    function Shader() {}

    Shader.prototype.shade = function(lights, renderModel, material) {};

    return Shader;

  })();

  seen.ShaderUtils = {
    applyDiffuse: function(c, light, lightNormal, surfaceNormal, material) {
      var dot;
      dot = lightNormal.dot(surfaceNormal);
      if (dot > 0) {
        return c._addChannels(light.colorIntensity.scale(dot));
      }
    },
    applyDiffuseAndSpecular: function(c, light, lightNormal, surfaceNormal, material) {
      var dot, eyeNormal, reflectionNormal, specularIntensity;
      dot = lightNormal.dot(surfaceNormal);
      if (dot > 0) {
        c._addChannels(light.colorIntensity.scale(dot));
        eyeNormal = seen.Points.Z;
        reflectionNormal = surfaceNormal.multiply(dot * 2).subtract(lightNormal);
        specularIntensity = Math.pow(1 + reflectionNormal.dot(eyeNormal), material.specularExponent);
        return c._offset(specularIntensity * light.intensity);
      }
    },
    applyAmbient: function(c, light) {
      return c._addChannels(light.colorIntensity);
    }
  };

  Phong = (function(_super) {
    __extends(Phong, _super);

    function Phong() {
      _ref = Phong.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Phong.prototype.shade = function(lights, renderModel, material) {
      var c, light, lightNormal, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3;
      c = new seen.Color();
      _ref1 = lights.points;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        light = _ref1[_i];
        lightNormal = light.point.subtract(renderModel.barycenter).normalize();
        seen.ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material);
      }
      _ref2 = lights.directionals;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        light = _ref2[_j];
        seen.ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material);
      }
      _ref3 = lights.ambients;
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        light = _ref3[_k];
        seen.ShaderUtils.applyAmbient(c, light);
      }
      c._multiplyChannels(material.color)._clamp(0, 0xFF);
      return c;
    };

    return Phong;

  })(seen.Shader);

  DiffusePhong = (function(_super) {
    __extends(DiffusePhong, _super);

    function DiffusePhong() {
      _ref1 = DiffusePhong.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    DiffusePhong.prototype.shade = function(lights, renderModel, material) {
      var c, light, lightNormal, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3, _ref4;
      c = new seen.Color();
      _ref2 = lights.points;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        light = _ref2[_i];
        lightNormal = light.point.subtract(renderModel.barycenter).normalize();
        seen.ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material);
      }
      _ref3 = lights.directionals;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        light = _ref3[_j];
        seen.ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material);
      }
      _ref4 = lights.ambients;
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        light = _ref4[_k];
        seen.ShaderUtils.applyAmbient(c, light);
      }
      c._multiplyChannels(material.color)._clamp(0, 0xFF);
      return c;
    };

    return DiffusePhong;

  })(seen.Shader);

  Ambient = (function(_super) {
    __extends(Ambient, _super);

    function Ambient() {
      _ref2 = Ambient.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Ambient.prototype.shade = function(lights, renderModel, material) {
      var c, light, _i, _len, _ref3;
      c = new seen.Color();
      _ref3 = lights.ambients;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        light = _ref3[_i];
        seen.ShaderUtils.applyAmbient(c, light);
      }
      c._multiplyChannels(material.color)._clamp(0, 0xFF);
      return c;
    };

    return Ambient;

  })(seen.Shader);

  Flat = (function(_super) {
    __extends(Flat, _super);

    function Flat() {
      _ref3 = Flat.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Flat.prototype.shade = function(lights, renderModel, material) {
      return material.color;
    };

    return Flat;

  })(seen.Shader);

  seen.Shaders = {
    phong: new Phong(),
    diffuse: new DiffusePhong(),
    ambient: new Ambient(),
    flat: new Flat()
  };

  seen.Renderer = (function() {
    function Renderer(scene) {
      this.scene = scene;
      this.render = __bind(this.render, this);
      this.scene.on('render.renderer', this.render);
    }

    Renderer.prototype.render = function(renderObjects) {
      var renderObject, _i, _len;
      this.reset();
      for (_i = 0, _len = renderObjects.length; _i < _len; _i++) {
        renderObject = renderObjects[_i];
        renderObject.surface.painter.paint(renderObject, this);
      }
      return this.hideUnused();
    };

    Renderer.prototype.path = function() {};

    Renderer.prototype.text = function() {};

    return Renderer;

  })();

  seen.RenderModel = (function() {
    function RenderModel(points, transform, projection) {
      this.points = points;
      this.transform = transform;
      this.projection = projection;
      this.transformed = this._initRenderData();
      this.projected = this._initRenderData();
      this._update();
    }

    RenderModel.prototype.update = function(transform, projection) {
      if (seen.Util.arraysEqual(transform.m, this.transform.m) && seen.Util.arraysEqual(projection.m, this.projection.m)) {

      } else {
        this.transform = transform;
        this.projection = projection;
        return this._update();
      }
    };

    RenderModel.prototype._update = function() {
      this._math(this.transformed, this.points, this.transform, false);
      return this._math(this.projected, this.transformed.points, this.projection, true);
    };

    RenderModel.prototype._initRenderData = function() {
      var p;
      return {
        points: (function() {
          var _i, _len, _ref4, _results;
          _ref4 = this.points;
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            p = _ref4[_i];
            _results.push(p.copy());
          }
          return _results;
        }).call(this),
        barycenter: seen.P(),
        normal: seen.P(),
        v0: seen.P(),
        v1: seen.P()
      };
    };

    RenderModel.prototype._math = function(set, points, transform, applyClip) {
      var i, p, sp, _i, _j, _len, _len1, _ref4;
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
      _ref4 = set.points;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        p = _ref4[_j];
        set.barycenter._add(p);
      }
      set.barycenter._divide(set.points.length);
      set.v0.set(set.points[1])._subtract(set.points[0]);
      set.v1.set(set.points[points.length - 1])._subtract(set.points[0]);
      return set.normal.set(set.v0._cross(set.v1)._normalize());
    };

    return RenderModel;

  })();

  seen.Surface = (function() {
    Surface.prototype.cullBackfaces = true;

    Surface.prototype.fill = new seen.Material(seen.C.gray);

    Surface.prototype.stroke = null;

    function Surface(points, painter) {
      this.points = points;
      this.painter = painter != null ? painter : seen.Painters.path;
      this.id = 's' + seen.Util.uniqueId();
    }

    return Surface;

  })();

  seen.Shape = (function(_super) {
    __extends(Shape, _super);

    function Shape(type, surfaces) {
      this.type = type;
      this.surfaces = surfaces;
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

    return Shape;

  })(seen.Transformable);

  seen.Group = (function(_super) {
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
      group = new seen.Group;
      this.add(group);
      return group;
    };

    Group.prototype.eachShape = function(f) {
      var child, _i, _len, _ref4, _results;
      _ref4 = this.children;
      _results = [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        child = _ref4[_i];
        if (child instanceof seen.Shape) {
          f.call(this, child);
        }
        if (child instanceof seen.Group) {
          _results.push(child.eachTransformedShape(f));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Group.prototype.eachTransformedShape = function(f, m) {
      var child, _i, _len, _ref4, _results;
      if (m == null) {
        m = null;
      }
      if (m == null) {
        m = this.m;
      }
      _ref4 = this.children;
      _results = [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        child = _ref4[_i];
        if (child instanceof seen.Shape) {
          f.call(this, child, child.m.multiply(m));
        }
        if (child instanceof seen.Group) {
          _results.push(child.eachTransformedShape(f, child.m.multiply(m)));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Group;

  })(seen.Transformable);

  seen.Painter = (function() {
    function Painter() {}

    Painter.prototype.paint = function(renderObject, canvas) {};

    return Painter;

  })();

  PathPainter = (function(_super) {
    __extends(PathPainter, _super);

    function PathPainter() {
      _ref4 = PathPainter.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    PathPainter.prototype.paint = function(renderObject, canvas) {
      var _ref5;
      return canvas.path().path(renderObject.renderModel.projected.points).style({
        fill: renderObject.renderModel.fill == null ? 'none' : renderObject.renderModel.fill.hex(),
        stroke: renderObject.renderModel.stroke == null ? 'none' : renderObject.renderModel.stroke.hex(),
        'fill-opacity': renderObject.surface.fill == null ? 1.0 : renderObject.surface.fill.a / 0xFF,
        'stroke-width': (_ref5 = renderObject.surface['stroke-width']) != null ? _ref5 : 1
      });
    };

    return PathPainter;

  })(seen.Painter);

  TextPainter = (function(_super) {
    __extends(TextPainter, _super);

    function TextPainter() {
      _ref5 = TextPainter.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    TextPainter.prototype.paint = function(surface, canvas) {
      var _ref6;
      return canvas.text().text(renderObject.surface.text).transform(renderObject.renderModel.transform.multiply(renderObject.renderModel.projection)).style({
        fill: renderObject.renderModel.fill == null ? 'none' : renderObject.renderModel.fill.hex(),
        stroke: renderObject.renderModel.stroke == null ? 'none' : renderObject.renderModel.stroke.hex(),
        'text-anchor': (_ref6 = renderObject.surface.anchor) != null ? _ref6 : 'middle'
      });
    };

    return TextPainter;

  })(seen.Painter);

  seen.Painters = {
    path: new PathPainter(),
    text: new TextPainter()
  };

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
        surfaces.push(new seen.Surface(spts));
      }
      return surfaces;
    },
    cube: function() {
      var points;
      points = [seen.P(-1, -1, -1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(-1, 1, 1), seen.P(1, -1, -1), seen.P(1, -1, 1), seen.P(1, 1, -1), seen.P(1, 1, 1)];
      return new seen.Shape('cube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
    },
    unitcube: function() {
      var points;
      points = [seen.P(0, 0, 0), seen.P(0, 0, 1), seen.P(0, 1, 0), seen.P(0, 1, 1), seen.P(1, 0, 0), seen.P(1, 0, 1), seen.P(1, 1, 0), seen.P(1, 1, 1)];
      return new seen.Shape('unitcube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
    },
    rectangle: function(point1, point2) {
      var compose, points;
      compose = function(x, y, z) {
        return seen.P(x(point1.x, point2.x), y(point1.y, point2.y), z(point1.z, point2.z));
      };
      points = [compose(Math.min, Math.min, Math.min), compose(Math.min, Math.min, Math.max), compose(Math.min, Math.max, Math.min), compose(Math.min, Math.max, Math.max), compose(Math.max, Math.min, Math.min), compose(Math.max, Math.min, Math.max), compose(Math.max, Math.max, Math.min), compose(Math.max, Math.max, Math.max)];
      return new seen.Shape('rect', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap));
    },
    tetrahedron: function() {
      var coordinateMap, points;
      points = [seen.P(1, 1, 1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(1, -1, -1)];
      coordinateMap = [[0, 2, 1], [0, 1, 3], [3, 2, 0], [1, 2, 3]];
      return new seen.Shape('tetrahedron', seen.Shapes._mapPointsToSurfaces(points, coordinateMap));
    },
    text: function(text) {
      var surface;
      surface = new seen.Surface([seen.P(0, 0, -1), seen.P(0, 20, -1), seen.P(20, 0, -1)], seen.Painters.text);
      surface.text = text;
      surface.cullBackfaces = false;
      return new seen.Shape('text', [surface]);
    },
    extrude: function(points, distance) {
      var back, front, i, len, p, surfaces, _i, _ref6;
      if (distance == null) {
        distance = 1;
      }
      surfaces = [];
      front = new seen.Surface((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = points.length; _i < _len; _i++) {
          p = points[_i];
          _results.push(p.copy());
        }
        return _results;
      })());
      back = new seen.Surface((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = points.length; _i < _len; _i++) {
          p = points[_i];
          _results.push(p.translate(0, 0, distance));
        }
        return _results;
      })());
      for (i = _i = 1, _ref6 = points.length; 1 <= _ref6 ? _i < _ref6 : _i > _ref6; i = 1 <= _ref6 ? ++_i : --_i) {
        surfaces.push(new seen.Surface([front.points[i - 1].copy(), back.points[i - 1].copy(), back.points[i].copy(), front.points[i].copy()]));
      }
      len = points.length;
      surfaces.push(new seen.Surface([front.points[len - 1].copy(), back.points[len - 1].copy(), back.points[0].copy(), front.points[0].copy()]));
      back.points.reverse();
      surfaces.push(front);
      surfaces.push(back);
      return new seen.Shape('extrusion', surfaces);
    },
    arrow: function(thickness, tailLength, tailWidth, headLength, headPointiness) {
      var htw, points;
      if (thickness == null) {
        thickness = 1;
      }
      if (tailLength == null) {
        tailLength = 1;
      }
      if (tailWidth == null) {
        tailWidth = 1;
      }
      if (headLength == null) {
        headLength = 1;
      }
      if (headPointiness == null) {
        headPointiness = 0;
      }
      htw = tailWidth / 2;
      points = [seen.P(0, 0, 0), seen.P(headLength + headPointiness, 1, 0), seen.P(headLength, htw, 0), seen.P(headLength + tailLength, htw, 0), seen.P(headLength + tailLength, -htw, 0), seen.P(headLength, -htw, 0), seen.P(headLength + headPointiness, -1, 0)];
      return seen.Shapes.extrude(points, thickness);
    },
    path: function(points) {
      return new seen.Shape('path', [new seen.Surface(points)]);
    },
    custom: function(s) {
      var f, p, surfaces, _i, _len, _ref6;
      surfaces = [];
      _ref6 = s.surfaces;
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        f = _ref6[_i];
        surfaces.push(new seen.Surface((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = f.length; _j < _len1; _j++) {
            p = f[_j];
            _results.push(seen.P.apply(seen, p));
          }
          return _results;
        })()));
      }
      return new seen.Shape('custom', surfaces);
    }
  };

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
    orthoExtent: function(extentX, extentY, extentZ) {
      if (extentX == null) {
        extentX = 100;
      }
      if (extentY == null) {
        extentY = extentX;
      }
      if (extentZ == null) {
        extentZ = extentY;
      }
      return seen.Projections.ortho(-extentX, extentX, -extentY, extentY, extentY, 2 * extentY);
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
    },
    matchOrigin: function(width, height, x, y) {
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
      return new seen.Matrix().scale(width, -height).translate(x, y + height);
    }
  };

  seen.Camera = (function() {
    Camera.prototype.defaults = {
      projection: seen.Projections.orthoExtent(),
      viewport: seen.Viewports.centerOrigin(),
      location: seen.P(0, 0, 0)
    };

    function Camera(options) {
      seen.Util.defaults(this, options, this.defaults);
    }

    return Camera;

  })();

  seen.Cameras = {
    orthoCenterOrigin: function(width, height) {
      if (width == null) {
        width = 500;
      }
      if (height == null) {
        height = 500;
      }
      return new seen.Camera({
        projection: seen.Projections.orthoExtent(width / 2, height / 2, height / 2),
        viewport: seen.Viewports.centerOrigin(width, height)
      });
    },
    orthoMatchOrigin: function(width, height) {
      if (width == null) {
        width = 500;
      }
      if (height == null) {
        height = 500;
      }
      return new seen.Camera({
        projection: seen.Projections.ortho(-width, width, -height, height, height, height * 2),
        viewport: seen.Viewports.matchOrigin(width, height)
      });
    }
  };

  _svg = function(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  };

  _line = d3.svg.line().x(function(d) {
    return d.x;
  }).y(function(d) {
    return d.y;
  });

  seen.SvgRenderer = (function(_super) {
    __extends(SvgRenderer, _super);

    function SvgRenderer() {
      _ref6 = SvgRenderer.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    SvgRenderer.prototype.addTo = function(layer) {
      return this._g = layer;
    };

    SvgRenderer.prototype.path = function() {
      var el;
      el = this._manifest('path');
      return {
        el: el,
        path: function(points) {
          el.setAttribute('d', _line(points));
          return this;
        },
        style: function(style) {
          var key, str, val;
          str = '';
          for (key in style) {
            val = style[key];
            str += "" + key + ":" + val + ";";
          }
          el.setAttribute('style', str);
          return this;
        }
      };
    };

    SvgRenderer.prototype.text = function() {
      var el;
      el = this._manifest('text');
      el.setAttribute('font-family', 'Roboto');
      return {
        el: el,
        text: function(text) {
          el.textContent = text;
          return this;
        },
        style: function(style) {
          var key, str, val;
          str = '';
          for (key in style) {
            val = style[key];
            str += "" + key + ":" + val + ";";
          }
          el.setAttribute('style', str);
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

    SvgRenderer.prototype.reset = function() {
      return this._i = 0;
    };

    SvgRenderer.prototype.hideUnused = function() {
      var children, _results;
      children = this._g.childNodes;
      _results = [];
      while (this._i < children.length) {
        children[this._i].setAttribute('style', 'display: none;');
        _results.push(this._i++);
      }
      return _results;
    };

    SvgRenderer.prototype._manifest = function(type) {
      var children, current, path;
      children = this._g.childNodes;
      if (this._i >= children.length) {
        path = _svg(type);
        this._g.appendChild(path);
        this._i++;
        return path;
      }
      current = children[this._i];
      if (current.tagName === type) {
        this._i++;
        return current;
      } else {
        path = _svg(type);
        this._g.replaceChild(path, current);
        this._i++;
        return path;
      }
    };

    return SvgRenderer;

  })(seen.Renderer);

  seen.SvgCanvas = (function() {
    function SvgCanvas(svg) {
      this.svg = svg;
      this.layers = {};
    }

    SvgCanvas.prototype.layer = function(name, component) {
      var layer;
      layer = this.layers[name] = _svg('g');
      this.svg.appendChild(layer);
      if (component != null) {
        component.addTo(layer);
      }
      return this;
    };

    return SvgCanvas;

  })();

  seen.SvgRenderDebug = (function() {
    function SvgRenderDebug(scene) {
      this._renderEnd = __bind(this._renderEnd, this);
      this._renderStart = __bind(this._renderStart, this);
      this._text = _svg('text');
      this._text.setAttribute('style', 'text-anchor:end;');
      this._text.setAttribute('x', 500 - 10);
      this._text.setAttribute('y', '20');
      this._fps = 30;
      scene.on('beforeRender.debug', this._renderStart);
      scene.on('afterRender.debug', this._renderEnd);
    }

    SvgRenderDebug.prototype.addTo = function(layer) {
      return layer.appendChild(this._text);
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
      return this._text.textContent = "fps: " + (this._fps.toFixed(1)) + " surfaces: " + e.length;
    };

    return SvgRenderDebug;

  })();

  seen.SvgFillRect = (function() {
    function SvgFillRect(width, height) {
      this.width = width != null ? width : 500;
      this.height = height != null ? height : 500;
    }

    SvgFillRect.prototype.addTo = function(layer) {
      var rect;
      rect = _svg('rect');
      rect.setAttribute('fill', '#EEE');
      rect.setAttribute('width', this.width);
      rect.setAttribute('height', this.width);
      return layer.appendChild(rect);
    };

    return SvgFillRect;

  })();

  seen.Scene = (function() {
    Scene.prototype.defaults = {
      cullBackfaces: true,
      camera: seen.Cameras.orthoCenterOrigin(500, 500)
    };

    function Scene(options) {
      this._renderSurfaces = __bind(this._renderSurfaces, this);
      this.render = __bind(this.render, this);
      seen.Util.defaults(this, options, this.defaults);
      this.dispatch = d3.dispatch('beforeRender', 'afterRender', 'render');
      d3.rebind(this, this.dispatch, ['on']);
      this.group = new seen.Group();
      this.shader = seen.Shaders.phong;
      this.lights = {
        points: [],
        directionals: [],
        ambients: []
      };
      this.surfaces = [];
      this._renderModelCache = {};
    }

    Scene.prototype.startRenderLoop = function(msecDelay) {
      if (msecDelay == null) {
        msecDelay = 30;
      }
      return setInterval(this.render, msecDelay);
    };

    Scene.prototype.render = function() {
      var renderObjects;
      this.dispatch.beforeRender();
      renderObjects = this._renderSurfaces();
      this.dispatch.render(renderObjects);
      this.dispatch.afterRender(renderObjects);
      return this;
    };

    Scene.prototype._renderSurfaces = function() {
      var key, light, lights, projection, _i, _len, _ref7,
        _this = this;
      projection = this.camera.projection.multiply(this.camera.viewport);
      _ref7 = this.lights;
      for (key in _ref7) {
        lights = _ref7[key];
        for (_i = 0, _len = lights.length; _i < _len; _i++) {
          light = lights[_i];
          light.render();
        }
      }
      this.surfaces.length = 0;
      this.group.eachTransformedShape(function(shape, transform) {
        var renderModel, surface, _j, _len1, _ref10, _ref8, _ref9, _results;
        _ref8 = shape.surfaces;
        _results = [];
        for (_j = 0, _len1 = _ref8.length; _j < _len1; _j++) {
          surface = _ref8[_j];
          renderModel = _this._renderSurface(surface, transform, projection);
          if (!_this.cullBackfaces || !surface.cullBackfaces || renderModel.projected.normal.z < 0) {
            renderModel.fill = (_ref9 = surface.fill) != null ? _ref9.render(_this.lights, _this.shader, renderModel.transformed) : void 0;
            renderModel.stroke = (_ref10 = surface.stroke) != null ? _ref10.render(_this.lights, _this.shader, renderModel.transformed) : void 0;
            _results.push(_this.surfaces.push({
              renderModel: renderModel,
              surface: surface
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      this.surfaces.sort(function(a, b) {
        return b.renderModel.projected.barycenter.z - a.renderModel.projected.barycenter.z;
      });
      return this.surfaces;
    };

    Scene.prototype._renderSurface = function(surface, transform, projection) {
      var renderModel;
      renderModel = this._renderModelCache[surface.id];
      if (renderModel == null) {
        renderModel = this._renderModelCache[surface.id] = new seen.RenderModel(surface.points, transform, projection);
      } else {
        renderModel.update(transform, projection);
      }
      return renderModel;
    };

    return Scene;

  })();

}).call(this);
