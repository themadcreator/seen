/** seen.js v0.2.3 | themadcreator.github.io/seen | (c) Bill Dwyer | @license: Apache 2.0 */
(function() {
  var ARRAY_POOL, Ambient, CUBE_COORDINATE_MAP, DEFAULT_FRAME_DELAY, DEFAULT_NORMAL, DiffusePhong, EQUILATERAL_TRIANGLE_ALTITUDE, EYE_NORMAL, Flat, ICOSAHEDRON_COORDINATE_MAP, ICOSAHEDRON_POINTS, ICOS_X, ICOS_Z, IDENTITY, NEXT_UNIQUE_ID, POINT_POOL, PYRAMID_COORDINATE_MAP, Phong, TETRAHEDRON_COORDINATE_MAP, TRANSPOSE_INDICES, requestAnimationFrame, seen, _ref, _ref1, _ref2, _svg,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  seen = {};

  if (typeof window !== "undefined" && window !== null) {
    window.seen = seen;
  }

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = seen;
  }

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
    uniqueId: function(prefix) {
      if (prefix == null) {
        prefix = '';
      }
      return prefix + NEXT_UNIQUE_ID++;
    },
    element: function(elementOrString) {
      if (typeof elementOrString === 'string') {
        return document.getElementById(elementOrString);
      } else {
        return elementOrString;
      }
    }
  };

  seen.Events = {
    dispatch: function() {
      var arg, dispatch, _i, _len;
      dispatch = new seen.Events.Dispatcher();
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        dispatch[arg] = seen.Events.Event();
      }
      return dispatch;
    }
  };

  seen.Events.Dispatcher = (function() {
    function Dispatcher() {
      this.on = __bind(this.on, this);
    }

    Dispatcher.prototype.on = function(type, listener) {
      var i, name;
      i = type.indexOf('.');
      name = '';
      if (i > 0) {
        name = type.substring(i + 1);
        type = type.substring(0, i);
      }
      if (this[type] != null) {
        this[type].on(name, listener);
      }
      return this;
    };

    return Dispatcher;

  })();

  seen.Events.Event = function() {
    var event;
    event = function() {
      var l, name, _ref, _results;
      _ref = event.listenerMap;
      _results = [];
      for (name in _ref) {
        l = _ref[name];
        if (l != null) {
          _results.push(l.apply(this, arguments));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    event.listenerMap = {};
    event.on = function(name, listener) {
      delete event.listenerMap[name];
      if (listener != null) {
        return event.listenerMap[name] = listener;
      }
    };
    return event;
  };

  ARRAY_POOL = new Array(16);

  IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  TRANSPOSE_INDICES = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];

  seen.Matrix = (function() {
    function Matrix(m) {
      this.m = m != null ? m : null;
      if (this.m == null) {
        this.m = IDENTITY.slice();
      }
      this.baked = IDENTITY;
    }

    Matrix.prototype.copy = function() {
      return new seen.Matrix(this.m.slice());
    };

    Matrix.prototype.matrix = function(m) {
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

    Matrix.prototype.reset = function() {
      this.m = this.baked.slice();
      return this;
    };

    Matrix.prototype.bake = function(m) {
      this.baked = (m != null ? m : this.m).slice();
      return this;
    };

    Matrix.prototype.multiply = function(b) {
      return this.matrix(b.m);
    };

    Matrix.prototype.transpose = function() {
      var c, i, ti, _i, _len;
      c = ARRAY_POOL;
      for (i = _i = 0, _len = TRANSPOSE_INDICES.length; _i < _len; i = ++_i) {
        ti = TRANSPOSE_INDICES[i];
        c[i] = this.m[ti];
      }
      ARRAY_POOL = this.m;
      this.m = c;
      return this;
    };

    Matrix.prototype.rotx = function(theta) {
      var ct, rm, st;
      ct = Math.cos(theta);
      st = Math.sin(theta);
      rm = [1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1];
      return this.matrix(rm);
    };

    Matrix.prototype.roty = function(theta) {
      var ct, rm, st;
      ct = Math.cos(theta);
      st = Math.sin(theta);
      rm = [ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1];
      return this.matrix(rm);
    };

    Matrix.prototype.rotz = function(theta) {
      var ct, rm, st;
      ct = Math.cos(theta);
      st = Math.sin(theta);
      rm = [ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      return this.matrix(rm);
    };

    Matrix.prototype.translate = function(x, y, z) {
      var rm;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (z == null) {
        z = 0;
      }
      rm = [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
      return this.matrix(rm);
    };

    Matrix.prototype.scale = function(sx, sy, sz) {
      var rm;
      if (sx == null) {
        sx = 1;
      }
      if (sy == null) {
        sy = sx;
      }
      if (sz == null) {
        sz = sy;
      }
      rm = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
      return this.matrix(rm);
    };

    return Matrix;

  })();

  seen.M = function(m) {
    return new seen.Matrix(m);
  };

  seen.Matrices = {
    identity: function() {
      return seen.M();
    },
    flipX: function() {
      return seen.M().scale(-1, 1, 1);
    },
    flipY: function() {
      return seen.M().scale(1, -1, 1);
    },
    flipZ: function() {
      return seen.M().scale(1, 1, -1);
    }
  };

  seen.Transformable = (function() {
    function Transformable() {
      var method, _fn, _i, _len, _ref;
      this.m = new seen.Matrix();
      this.baked = IDENTITY;
      _ref = ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset', 'bake'];
      _fn = (function(_this) {
        return function(method) {
          return _this[method] = function() {
            var _ref1;
            (_ref1 = this.m[method]).call.apply(_ref1, [this.m].concat(__slice.call(arguments)));
            return this;
          };
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        _fn(method);
      }
    }

    Transformable.prototype.transform = function(m) {
      this.m.multiply(m);
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

    Point.prototype.copy = function() {
      return new seen.Point(this.x, this.y, this.z, this.w);
    };

    Point.prototype.set = function(p) {
      this.x = p.x;
      this.y = p.y;
      this.z = p.z;
      this.w = p.w;
      return this;
    };

    Point.prototype.add = function(q) {
      this.x += q.x;
      this.y += q.y;
      this.z += q.z;
      return this;
    };

    Point.prototype.subtract = function(q) {
      this.x -= q.x;
      this.y -= q.y;
      this.z -= q.z;
      return this;
    };

    Point.prototype.translate = function(x, y, z) {
      this.x += x;
      this.y += y;
      this.z += z;
      return this;
    };

    Point.prototype.multiply = function(n) {
      this.x *= n;
      this.y *= n;
      this.z *= n;
      return this;
    };

    Point.prototype.divide = function(n) {
      this.x /= n;
      this.y /= n;
      this.z /= n;
      return this;
    };

    Point.prototype.round = function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    };

    Point.prototype.normalize = function() {
      var n;
      n = this.magnitude();
      if (n === 0) {
        this.set(seen.Points.Z());
      } else {
        this.divide(n);
      }
      return this;
    };

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

    Point.prototype.magnitudeSquared = function() {
      return this.dot(this);
    };

    Point.prototype.magnitude = function() {
      return Math.sqrt(this.magnitudeSquared());
    };

    Point.prototype.dot = function(q) {
      return this.x * q.x + this.y * q.y + this.z * q.z;
    };

    Point.prototype.cross = function(q) {
      var r;
      r = POINT_POOL;
      r.x = this.y * q.z - this.z * q.y;
      r.y = this.z * q.x - this.x * q.z;
      r.z = this.x * q.y - this.y * q.x;
      this.set(r);
      return this;
    };

    return Point;

  })();

  seen.P = function(x, y, z, w) {
    return new seen.Point(x, y, z, w);
  };

  POINT_POOL = seen.P();

  seen.Points = {
    X: function() {
      return seen.P(1, 0, 0);
    },
    Y: function() {
      return seen.P(0, 1, 0);
    },
    Z: function() {
      return seen.P(0, 0, 1);
    },
    ZERO: function() {
      return seen.P(0, 0, 0);
    }
  };

  seen.Quaternion = (function() {
    Quaternion.pixelsPerRadian = 150;

    Quaternion.xyToTransform = function(x, y) {
      var quatX, quatY;
      quatX = seen.Quaternion.pointAngle(seen.Points.Y(), x / seen.Quaternion.pixelsPerRadian);
      quatY = seen.Quaternion.pointAngle(seen.Points.X(), y / seen.Quaternion.pixelsPerRadian);
      return quatX.multiply(quatY).toMatrix();
    };

    Quaternion.axisAngle = function(x, y, z, angleRads) {
      var scale, w;
      scale = Math.sin(angleRads / 2.0);
      w = Math.cos(angleRads / 2.0);
      return new seen.Quaternion(scale * x, scale * y, scale * z, w);
    };

    Quaternion.pointAngle = function(p, angleRads) {
      var scale, w;
      scale = Math.sin(angleRads / 2.0);
      w = Math.cos(angleRads / 2.0);
      return new seen.Quaternion(scale * p.x, scale * p.y, scale * p.z, w);
    };

    function Quaternion() {
      this.q = seen.P.apply(seen, arguments);
    }

    Quaternion.prototype.multiply = function(q) {
      var r, result;
      r = seen.P();
      r.w = this.q.w * q.q.w - this.q.x * q.q.x - this.q.y * q.q.y - this.q.z * q.q.z;
      r.x = this.q.w * q.q.x + this.q.x * q.q.w + this.q.y * q.q.z - this.q.z * q.q.y;
      r.y = this.q.w * q.q.y + this.q.y * q.q.w + this.q.z * q.q.x - this.q.x * q.q.z;
      r.z = this.q.w * q.q.z + this.q.z * q.q.w + this.q.x * q.q.y - this.q.y * q.q.x;
      result = new seen.Quaternion();
      result.q = r;
      return result;
    };

    Quaternion.prototype.toMatrix = function() {
      var m;
      m = new Array(16);
      m[0] = 1.0 - 2.0 * (this.q.y * this.q.y + this.q.z * this.q.z);
      m[1] = 2.0 * (this.q.x * this.q.y - this.q.w * this.q.z);
      m[2] = 2.0 * (this.q.x * this.q.z + this.q.w * this.q.y);
      m[3] = 0.0;
      m[4] = 2.0 * (this.q.x * this.q.y + this.q.w * this.q.z);
      m[5] = 1.0 - 2.0 * (this.q.x * this.q.x + this.q.z * this.q.z);
      m[6] = 2.0 * (this.q.y * this.q.z - this.q.w * this.q.x);
      m[7] = 0.0;
      m[8] = 2.0 * (this.q.x * this.q.z - this.q.w * this.q.y);
      m[9] = 2.0 * (this.q.y * this.q.z + this.q.w * this.q.x);
      m[10] = 1.0 - 2.0 * (this.q.x * this.q.x + this.q.y * this.q.y);
      m[11] = 0.0;
      m[12] = 0;
      m[13] = 0;
      m[14] = 0;
      m[15] = 1.0;
      return seen.M(m);
    };

    return Quaternion;

  })();

  seen.Bounds = (function() {
    Bounds.points = function(points) {
      var box, p, _i, _len;
      box = new seen.Bounds();
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        p = points[_i];
        box.add(p);
      }
      return box;
    };

    Bounds.xywh = function(x, y, w, h) {
      return seen.Boundses.xyzwhd(x, y, 0, w, h, 0);
    };

    Bounds.xyzwhd = function(x, y, z, w, h, d) {
      var box;
      box = new seen.Bounds();
      box.add(seen.P(x, y, z));
      box.add(seen.P(x + w, y + h, z + d));
      return box;
    };

    function Bounds() {
      this.maxZ = __bind(this.maxZ, this);
      this.maxY = __bind(this.maxY, this);
      this.maxX = __bind(this.maxX, this);
      this.minZ = __bind(this.minZ, this);
      this.minY = __bind(this.minY, this);
      this.minX = __bind(this.minX, this);
      this.depth = __bind(this.depth, this);
      this.height = __bind(this.height, this);
      this.width = __bind(this.width, this);
      this.min = null;
      this.max = null;
    }

    Bounds.prototype.copy = function() {
      var box, _ref, _ref1;
      box = new seen.Bounds();
      box.min = (_ref = this.min) != null ? _ref.copy() : void 0;
      box.max = (_ref1 = this.max) != null ? _ref1.copy() : void 0;
      return box;
    };

    Bounds.prototype.add = function(p) {
      if (!((this.min != null) && (this.max != null))) {
        this.min = p.copy();
        this.max = p.copy();
      } else {
        this.min.x = Math.min(this.min.x, p.x);
        this.min.y = Math.min(this.min.y, p.y);
        this.min.z = Math.min(this.min.z, p.z);
        this.max.x = Math.max(this.max.x, p.x);
        this.max.y = Math.max(this.max.y, p.y);
        this.max.z = Math.max(this.max.z, p.z);
      }
      return this;
    };

    Bounds.prototype.valid = function() {
      return (this.min != null) && (this.max != null);
    };

    Bounds.prototype.intersect = function(box) {
      if (!this.valid() || !box.valid()) {
        this.min = null;
        this.max = null;
      } else {
        this.min = seen.P(Math.max(this.min.x, box.min.x), Math.max(this.min.y, box.min.y), Math.max(this.min.z, box.min.z));
        this.max = seen.P(Math.min(this.max.x, box.max.x), Math.min(this.max.y, box.max.y), Math.min(this.max.z, box.max.z));
        if (this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z) {
          this.min = null;
          this.max = null;
        }
      }
      return this;
    };

    Bounds.prototype.pad = function(x, y, z) {
      var p;
      if (this.valid()) {
        if (y == null) {
          y = x;
        }
        if (z == null) {
          z = y;
        }
        p = seen.P(x, y, z);
        this.min.subtract(p);
        this.max.add(p);
      }
      return this;
    };

    Bounds.prototype.reset = function() {
      this.min = null;
      this.max = null;
      return this;
    };

    Bounds.prototype.contains = function(p) {
      if (!this.valid()) {
        return false;
      } else if (this.min.x > p.x || this.max.x < p.x) {
        return false;
      } else if (this.min.y > p.y || this.max.y < p.y) {
        return false;
      } else if (this.min.z > p.z || this.max.z < p.z) {
        return false;
      } else {
        return true;
      }
    };

    Bounds.prototype.center = function() {
      return seen.P(this.minX() + this.width() / 2, this.minY() + this.height() / 2, this.minZ() + this.depth() / 2);
    };

    Bounds.prototype.width = function() {
      return this.maxX() - this.minX();
    };

    Bounds.prototype.height = function() {
      return this.maxY() - this.minY();
    };

    Bounds.prototype.depth = function() {
      return this.maxZ() - this.minZ();
    };

    Bounds.prototype.minX = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.min) != null ? _ref1.x : void 0) != null ? _ref : 0;
    };

    Bounds.prototype.minY = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.min) != null ? _ref1.y : void 0) != null ? _ref : 0;
    };

    Bounds.prototype.minZ = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.min) != null ? _ref1.z : void 0) != null ? _ref : 0;
    };

    Bounds.prototype.maxX = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.max) != null ? _ref1.x : void 0) != null ? _ref : 0;
    };

    Bounds.prototype.maxY = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.max) != null ? _ref1.y : void 0) != null ? _ref : 0;
    };

    Bounds.prototype.maxZ = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.max) != null ? _ref1.z : void 0) != null ? _ref : 0;
    };

    return Bounds;

  })();

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
      this.r *= n;
      this.g *= n;
      this.b *= n;
      return this;
    };

    Color.prototype.offset = function(n) {
      this.r += n;
      this.g += n;
      this.b += n;
      return this;
    };

    Color.prototype.clamp = function(min, max) {
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

    Color.prototype.minChannels = function(c) {
      this.r = Math.min(c.r, this.r);
      this.g = Math.min(c.g, this.g);
      this.b = Math.min(c.b, this.b);
      return this;
    };

    Color.prototype.addChannels = function(c) {
      this.r += c.r;
      this.g += c.g;
      this.b += c.b;
      return this;
    };

    Color.prototype.multiplyChannels = function(c) {
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
    CSS_RGBA_STRING_REGEX: /rgb(a)?\(([0-9.]+),([0-9.]+),*([0-9.]+)(,([0-9.]+))?\)/,
    parse: function(str) {
      var a, m;
      if (str.charAt(0) === '#' && str.length === 7) {
        return seen.Colors.hex(str);
      } else if (str.indexOf('rgb') === 0) {
        m = seen.Colors.CSS_RGBA_STRING_REGEX.exec(str);
        if (m == null) {
          return seen.Colors.black();
        }
        a = m[6] != null ? Math.round(parseFloat(m[6]) * 0xFF) : void 0;
        return new seen.Color(parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), a);
      } else {
        return seen.Colors.black();
      }
    },
    rgb: function(r, g, b, a) {
      if (a == null) {
        a = 255;
      }
      return new seen.Color(r, g, b, a);
    },
    hex: function(hex) {
      if (hex.charAt(0) === '#') {
        hex = hex.substring(1);
      }
      return new seen.Color(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16));
    },
    hsl: function(h, s, l, a) {
      var b, g, hue2rgb, p, q, r;
      if (a == null) {
        a = 1;
      }
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
      return new seen.Color(r * 255, g * 255, b * 255, a * 255);
    },
    randomSurfaces: function(shape, sat, lit) {
      var surface, _i, _len, _ref, _results;
      if (sat == null) {
        sat = 0.5;
      }
      if (lit == null) {
        lit = 0.4;
      }
      _ref = shape.surfaces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        surface = _ref[_i];
        _results.push(surface.fill(seen.Colors.hsl(Math.random(), sat, lit)));
      }
      return _results;
    },
    randomSurfaces2: function(shape, drift, sat, lit) {
      var hue, surface, _i, _len, _ref, _results;
      if (drift == null) {
        drift = 0.03;
      }
      if (sat == null) {
        sat = 0.5;
      }
      if (lit == null) {
        lit = 0.4;
      }
      hue = Math.random();
      _ref = shape.surfaces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        surface = _ref[_i];
        hue += (Math.random() - 0.5) * drift;
        while (hue < 0) {
          hue += 1;
        }
        while (hue > 1) {
          hue -= 1;
        }
        _results.push(surface.fill(seen.Colors.hsl(hue, 0.5, 0.4)));
      }
      return _results;
    },
    randomShape: function(shape, sat, lit) {
      if (sat == null) {
        sat = 0.5;
      }
      if (lit == null) {
        lit = 0.4;
      }
      return shape.fill(new seen.Material(seen.Colors.hsl(Math.random(), sat, lit)));
    },
    black: function() {
      return this.hex('#000000');
    },
    white: function() {
      return this.hex('#FFFFFF');
    },
    gray: function() {
      return this.hex('#888888');
    }
  };

  seen.C = function(r, g, b, a) {
    return new seen.Color(r, g, b, a);
  };

  seen.Material = (function() {
    Material.create = function(value) {
      if (value instanceof seen.Material) {
        return value;
      } else if (value instanceof seen.Color) {
        return new seen.Material(value);
      } else if (typeof value === 'string') {
        return new seen.Material(seen.Colors.parse(value));
      } else {
        return new seen.Material();
      }
    };

    Material.prototype.defaults = {
      color: seen.Colors.gray(),
      metallic: false,
      specularColor: seen.Colors.white(),
      specularExponent: 15,
      shader: null
    };

    function Material(color, options) {
      this.color = color;
      if (options == null) {
        options = {};
      }
      seen.Util.defaults(this, options, this.defaults);
    }

    Material.prototype.render = function(lights, shader, renderData) {
      var color, renderShader, _ref;
      renderShader = (_ref = this.shader) != null ? _ref : shader;
      color = renderShader.shade(lights, renderData, this);
      color.a = this.color.a;
      return color;
    };

    return Material;

  })();

  seen.Light = (function(_super) {
    __extends(Light, _super);

    Light.prototype.defaults = {
      point: seen.P(),
      color: seen.Colors.white(),
      intensity: 0.01,
      normal: seen.P(1, -1, -1).normalize(),
      enabled: true
    };

    function Light(type, options) {
      this.type = type;
      Light.__super__.constructor.apply(this, arguments);
      seen.Util.defaults(this, options, this.defaults);
      this.id = seen.Util.uniqueId('l');
    }

    Light.prototype.render = function() {
      return this.colorIntensity = this.color.copy().scale(this.intensity);
    };

    return Light;

  })(seen.Transformable);

  seen.Lights = {
    point: function(opts) {
      return new seen.Light('point', opts);
    },
    directional: function(opts) {
      return new seen.Light('directional', opts);
    },
    ambient: function(opts) {
      return new seen.Light('ambient', opts);
    }
  };

  EYE_NORMAL = seen.Points.Z();

  seen.ShaderUtils = {
    applyDiffuse: function(c, light, lightNormal, surfaceNormal, material) {
      var dot;
      dot = lightNormal.dot(surfaceNormal);
      if (dot > 0) {
        return c.addChannels(light.colorIntensity.copy().scale(dot));
      }
    },
    applyDiffuseAndSpecular: function(c, light, lightNormal, surfaceNormal, material) {
      var dot, reflectionNormal, specularColor, specularIntensity;
      dot = lightNormal.dot(surfaceNormal);
      if (dot > 0) {
        c.addChannels(light.colorIntensity.copy().scale(dot));
        reflectionNormal = surfaceNormal.copy().multiply(dot * 2).subtract(lightNormal);
        specularIntensity = Math.pow(0.5 + reflectionNormal.dot(EYE_NORMAL), material.specularExponent);
        specularColor = material.specularColor.copy().scale(specularIntensity * light.intensity / 255.0);
        return c.addChannels(specularColor);
      }
    },
    applyAmbient: function(c, light) {
      return c.addChannels(light.colorIntensity);
    }
  };

  seen.Shader = (function() {
    function Shader() {}

    Shader.prototype.shade = function(lights, renderModel, material) {};

    return Shader;

  })();

  Phong = (function(_super) {
    __extends(Phong, _super);

    function Phong() {
      return Phong.__super__.constructor.apply(this, arguments);
    }

    Phong.prototype.shade = function(lights, renderModel, material) {
      var c, light, lightNormal, _i, _len;
      c = new seen.Color();
      for (_i = 0, _len = lights.length; _i < _len; _i++) {
        light = lights[_i];
        switch (light.type) {
          case 'point':
            lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize();
            seen.ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material);
            break;
          case 'directional':
            seen.ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material);
            break;
          case 'ambient':
            seen.ShaderUtils.applyAmbient(c, light);
        }
      }
      c.multiplyChannels(material.color);
      if (material.metallic) {
        c.minChannels(material.specularColor);
      }
      c.clamp(0, 0xFF);
      return c;
    };

    return Phong;

  })(seen.Shader);

  DiffusePhong = (function(_super) {
    __extends(DiffusePhong, _super);

    function DiffusePhong() {
      return DiffusePhong.__super__.constructor.apply(this, arguments);
    }

    DiffusePhong.prototype.shade = function(lights, renderModel, material) {
      var c, light, lightNormal, _i, _len;
      c = new seen.Color();
      for (_i = 0, _len = lights.length; _i < _len; _i++) {
        light = lights[_i];
        switch (light.type) {
          case 'point':
            lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize();
            seen.ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material);
            break;
          case 'directional':
            seen.ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material);
            break;
          case 'ambient':
            seen.ShaderUtils.applyAmbient(c, light);
        }
      }
      c.multiplyChannels(material.color).clamp(0, 0xFF);
      return c;
    };

    return DiffusePhong;

  })(seen.Shader);

  Ambient = (function(_super) {
    __extends(Ambient, _super);

    function Ambient() {
      return Ambient.__super__.constructor.apply(this, arguments);
    }

    Ambient.prototype.shade = function(lights, renderModel, material) {
      var c, light, _i, _len;
      c = new seen.Color();
      for (_i = 0, _len = lights.length; _i < _len; _i++) {
        light = lights[_i];
        switch (light.type) {
          case 'ambient':
            seen.ShaderUtils.applyAmbient(c, light);
        }
      }
      c.multiplyChannels(material.color).clamp(0, 0xFF);
      return c;
    };

    return Ambient;

  })(seen.Shader);

  Flat = (function(_super) {
    __extends(Flat, _super);

    function Flat() {
      return Flat.__super__.constructor.apply(this, arguments);
    }

    Flat.prototype.shade = function(lights, renderModel, material) {
      return material.color;
    };

    return Flat;

  })(seen.Shader);

  seen.Shaders = {
    phong: function() {
      return new Phong();
    },
    diffuse: function() {
      return new DiffusePhong();
    },
    ambient: function() {
      return new Ambient();
    },
    flat: function() {
      return new Flat();
    }
  };

  seen.Affine = {
    ORTHONORMAL_BASIS: function() {
      return [seen.P(0, 0, 0), seen.P(20, 0, 0), seen.P(0, 20, 0)];
    },
    INITIAL_STATE_MATRIX: [[20, 0, 1, 0, 0, 0], [0, 20, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, 20, 0, 1], [0, 0, 0, 0, 20, 1], [0, 0, 0, 0, 0, 1]],
    solveForAffineTransform: function(points) {
      var A, b, i, j, n, x, _i, _j, _ref, _ref1;
      A = seen.Affine.INITIAL_STATE_MATRIX;
      b = [points[1].x, points[2].x, points[0].x, points[1].y, points[2].y, points[0].y];
      x = new Array(6);
      n = A.length;
      for (i = _i = _ref = n - 1; _i >= 0; i = _i += -1) {
        x[i] = b[i];
        for (j = _j = _ref1 = i + 1; _ref1 <= n ? _j < n : _j > n; j = _ref1 <= n ? ++_j : --_j) {
          x[i] -= A[i][j] * x[j];
        }
        x[i] /= A[i][i];
      }
      return x;
    }
  };

  seen.RenderContext = (function() {
    function RenderContext() {
      this.render = __bind(this.render, this);
      this.layers = [];
    }

    RenderContext.prototype.render = function() {
      var layer, _i, _len, _ref;
      this.reset();
      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        layer.context.reset();
        layer.layer.render(layer.context);
        layer.context.cleanup();
      }
      this.cleanup();
      return this;
    };

    RenderContext.prototype.animate = function() {
      return new seen.RenderAnimator(this);
    };

    RenderContext.prototype.layer = function(layer) {
      this.layers.push({
        layer: layer,
        context: this
      });
      return this;
    };

    RenderContext.prototype.sceneLayer = function(scene) {
      this.layer(new seen.SceneLayer(scene));
      return this;
    };

    RenderContext.prototype.reset = function() {};

    RenderContext.prototype.cleanup = function() {};

    return RenderContext;

  })();

  seen.RenderLayerContext = (function() {
    function RenderLayerContext() {}

    RenderLayerContext.prototype.path = function() {};

    RenderLayerContext.prototype.rect = function() {};

    RenderLayerContext.prototype.circle = function() {};

    RenderLayerContext.prototype.text = function() {};

    RenderLayerContext.prototype.reset = function() {};

    RenderLayerContext.prototype.cleanup = function() {};

    return RenderLayerContext;

  })();

  seen.Context = function(elementId, scene) {
    var context, tag, _ref;
    if (scene == null) {
      scene = null;
    }
    tag = (_ref = seen.Util.element(elementId)) != null ? _ref.tagName.toUpperCase() : void 0;
    context = (function() {
      switch (tag) {
        case 'SVG':
        case 'G':
          return new seen.SvgRenderContext(elementId);
        case 'CANVAS':
          return new seen.CanvasRenderContext(elementId);
      }
    })();
    if ((context != null) && (scene != null)) {
      context.sceneLayer(scene);
    }
    return context;
  };

  seen.Painter = (function() {
    function Painter() {}

    Painter.prototype.paint = function(renderModel, context) {};

    return Painter;

  })();

  seen.PathPainter = (function(_super) {
    __extends(PathPainter, _super);

    function PathPainter() {
      return PathPainter.__super__.constructor.apply(this, arguments);
    }

    PathPainter.prototype.paint = function(renderModel, context) {
      var painter, _ref, _ref1;
      painter = context.path().path(renderModel.projected.points);
      if (renderModel.fill != null) {
        painter.fill({
          fill: renderModel.fill == null ? 'none' : renderModel.fill.hex(),
          'fill-opacity': ((_ref = renderModel.fill) != null ? _ref.a : void 0) == null ? 1.0 : renderModel.fill.a / 255.0
        });
      }
      if (renderModel.stroke != null) {
        return painter.draw({
          fill: 'none',
          stroke: renderModel.stroke == null ? 'none' : renderModel.stroke.hex(),
          'stroke-width': (_ref1 = renderModel.surface['stroke-width']) != null ? _ref1 : 1
        });
      }
    };

    return PathPainter;

  })(seen.Painter);

  seen.TextPainter = (function(_super) {
    __extends(TextPainter, _super);

    function TextPainter() {
      return TextPainter.__super__.constructor.apply(this, arguments);
    }

    TextPainter.prototype.paint = function(renderModel, context) {
      var style, xform, _ref;
      style = {
        fill: renderModel.fill == null ? 'none' : renderModel.fill.hex(),
        font: renderModel.surface.font,
        'text-anchor': (_ref = renderModel.surface.anchor) != null ? _ref : 'middle'
      };
      xform = seen.Affine.solveForAffineTransform(renderModel.projected.points);
      return context.text().fillText(xform, renderModel.surface.text, style);
    };

    return TextPainter;

  })(seen.Painter);

  seen.Painters = {
    path: new seen.PathPainter(),
    text: new seen.TextPainter()
  };

  DEFAULT_NORMAL = seen.Points.Z();

  seen.RenderModel = (function() {
    function RenderModel(surface, transform, projection, viewport) {
      this.surface = surface;
      this.transform = transform;
      this.projection = projection;
      this.viewport = viewport;
      this.points = this.surface.points;
      this.transformed = this._initRenderData();
      this.projected = this._initRenderData();
      this._update();
    }

    RenderModel.prototype.update = function(transform, projection, viewport) {
      if (!this.surface.dirty && seen.Util.arraysEqual(transform.m, this.transform.m) && seen.Util.arraysEqual(projection.m, this.projection.m) && seen.Util.arraysEqual(viewport.m, this.viewport.m)) {

      } else {
        this.transform = transform;
        this.projection = projection;
        this.viewport = viewport;
        return this._update();
      }
    };

    RenderModel.prototype._update = function() {
      var cameraSpace;
      this._math(this.transformed, this.points, this.transform, false);
      cameraSpace = this.transformed.points.map((function(_this) {
        return function(p) {
          return p.copy().transform(_this.projection);
        };
      })(this));
      this.inFrustrum = this._checkFrustrum(cameraSpace);
      this._math(this.projected, cameraSpace, this.viewport, true);
      return this.surface.dirty = false;
    };

    RenderModel.prototype._checkFrustrum = function(points) {
      var p, _i, _len;
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        p = points[_i];
        if (p.z <= -2) {
          return false;
        }
      }
      return true;
    };

    RenderModel.prototype._initRenderData = function() {
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
        bounds: new seen.Bounds(),
        barycenter: seen.P(),
        normal: seen.P(),
        v0: seen.P(),
        v1: seen.P()
      };
    };

    RenderModel.prototype._math = function(set, points, transform, applyClip) {
      var i, p, sp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      if (applyClip == null) {
        applyClip = false;
      }
      for (i = _i = 0, _len = points.length; _i < _len; i = ++_i) {
        p = points[i];
        sp = set.points[i];
        sp.set(p).transform(transform);
        if (applyClip) {
          sp.divide(sp.w);
        }
      }
      set.barycenter.multiply(0);
      _ref = set.points;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        p = _ref[_j];
        set.barycenter.add(p);
      }
      set.barycenter.divide(set.points.length);
      set.bounds.reset();
      _ref1 = set.points;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        p = _ref1[_k];
        set.bounds.add(p);
      }
      if (set.points.length < 2) {
        set.v0.set(DEFAULT_NORMAL);
        set.v1.set(DEFAULT_NORMAL);
        return set.normal.set(DEFAULT_NORMAL);
      } else {
        set.v0.set(set.points[1]).subtract(set.points[0]);
        set.v1.set(set.points[points.length - 1]).subtract(set.points[0]);
        return set.normal.set(set.v0).cross(set.v1).normalize();
      }
    };

    return RenderModel;

  })();

  seen.LightRenderModel = (function() {
    function LightRenderModel(light, transform) {
      var origin;
      this.light = light;
      this.colorIntensity = light.color.copy().scale(light.intensity);
      this.type = light.type;
      this.intensity = light.intensity;
      this.point = light.point.copy().transform(transform);
      origin = seen.Points.ZERO().transform(transform);
      this.normal = light.normal.copy().transform(transform).subtract(origin).normalize();
    }

    return LightRenderModel;

  })();

  seen.RenderLayer = (function() {
    function RenderLayer() {
      this.render = __bind(this.render, this);
    }

    RenderLayer.prototype.render = function(context) {};

    return RenderLayer;

  })();

  seen.SceneLayer = (function(_super) {
    __extends(SceneLayer, _super);

    function SceneLayer(scene) {
      this.scene = scene;
      this.render = __bind(this.render, this);
    }

    SceneLayer.prototype.render = function(context) {
      var renderModel, _i, _len, _ref, _results;
      _ref = this.scene.render();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        renderModel = _ref[_i];
        _results.push(renderModel.surface.painter.paint(renderModel, context));
      }
      return _results;
    };

    return SceneLayer;

  })(seen.RenderLayer);

  seen.FillLayer = (function(_super) {
    __extends(FillLayer, _super);

    function FillLayer(width, height, fill) {
      this.width = width != null ? width : 500;
      this.height = height != null ? height : 500;
      this.fill = fill != null ? fill : '#EEE';
      this.render = __bind(this.render, this);
    }

    FillLayer.prototype.render = function(context) {
      return context.rect().rect(this.width, this.height).fill({
        fill: this.fill
      });
    };

    return FillLayer;

  })(seen.RenderLayer);

  _svg = function(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  };

  seen.SvgStyler = (function() {
    SvgStyler.prototype._attributes = {};

    SvgStyler.prototype._svgTag = 'g';

    function SvgStyler(elementFactory) {
      this.elementFactory = elementFactory;
    }

    SvgStyler.prototype.clear = function() {
      this._attributes = {};
      return this;
    };

    SvgStyler.prototype.fill = function(style) {
      if (style == null) {
        style = {};
      }
      this._paint(style);
      return this;
    };

    SvgStyler.prototype.draw = function(style) {
      if (style == null) {
        style = {};
      }
      this._paint(style);
      return this;
    };

    SvgStyler.prototype._paint = function(style) {
      var el, key, str, value, _ref;
      el = this.elementFactory(this._svgTag);
      str = '';
      for (key in style) {
        value = style[key];
        str += "" + key + ":" + value + ";";
      }
      el.setAttribute('style', str);
      _ref = this._attributes;
      for (key in _ref) {
        value = _ref[key];
        el.setAttribute(key, value);
      }
      return el;
    };

    return SvgStyler;

  })();

  seen.SvgPathPainter = (function(_super) {
    __extends(SvgPathPainter, _super);

    function SvgPathPainter() {
      return SvgPathPainter.__super__.constructor.apply(this, arguments);
    }

    SvgPathPainter.prototype._svgTag = 'path';

    SvgPathPainter.prototype.path = function(points) {
      this._attributes.d = 'M' + points.map(function(p) {
        return "" + p.x + " " + p.y;
      }).join('L');
      return this;
    };

    return SvgPathPainter;

  })(seen.SvgStyler);

  seen.SvgTextPainter = (function() {
    SvgTextPainter.prototype._svgTag = 'text';

    function SvgTextPainter(elementFactory) {
      this.elementFactory = elementFactory;
    }

    SvgTextPainter.prototype.fillText = function(m, text, style) {
      var el, key, str, value;
      if (style == null) {
        style = {};
      }
      el = this.elementFactory(this._svgTag);
      el.setAttribute('transform', "matrix(" + m[0] + " " + m[3] + " " + (-m[1]) + " " + (-m[4]) + " " + m[2] + " " + m[5] + ")");
      str = '';
      for (key in style) {
        value = style[key];
        str += "" + key + ":" + value + ";";
      }
      el.setAttribute('style', str);
      return el.textContent = text;
    };

    return SvgTextPainter;

  })();

  seen.SvgRectPainter = (function(_super) {
    __extends(SvgRectPainter, _super);

    function SvgRectPainter() {
      return SvgRectPainter.__super__.constructor.apply(this, arguments);
    }

    SvgRectPainter.prototype._svgTag = 'rect';

    SvgRectPainter.prototype.rect = function(width, height) {
      this._attributes.width = width;
      this._attributes.height = height;
      return this;
    };

    return SvgRectPainter;

  })(seen.SvgStyler);

  seen.SvgCirclePainter = (function(_super) {
    __extends(SvgCirclePainter, _super);

    function SvgCirclePainter() {
      return SvgCirclePainter.__super__.constructor.apply(this, arguments);
    }

    SvgCirclePainter.prototype._svgTag = 'circle';

    SvgCirclePainter.prototype.circle = function(center, radius) {
      this._attributes.cx = center.x;
      this._attributes.cy = center.y;
      this._attributes.r = radius;
      return this;
    };

    return SvgCirclePainter;

  })(seen.SvgStyler);

  seen.SvgLayerRenderContext = (function(_super) {
    __extends(SvgLayerRenderContext, _super);

    function SvgLayerRenderContext(group) {
      this.group = group;
      this._elementFactory = __bind(this._elementFactory, this);
      this.pathPainter = new seen.SvgPathPainter(this._elementFactory);
      this.textPainter = new seen.SvgTextPainter(this._elementFactory);
      this.circlePainter = new seen.SvgCirclePainter(this._elementFactory);
      this.rectPainter = new seen.SvgRectPainter(this._elementFactory);
      this._i = 0;
    }

    SvgLayerRenderContext.prototype.path = function() {
      return this.pathPainter.clear();
    };

    SvgLayerRenderContext.prototype.rect = function() {
      return this.rectPainter.clear();
    };

    SvgLayerRenderContext.prototype.circle = function() {
      return this.circlePainter.clear();
    };

    SvgLayerRenderContext.prototype.text = function() {
      return this.textPainter;
    };

    SvgLayerRenderContext.prototype.reset = function() {
      return this._i = 0;
    };

    SvgLayerRenderContext.prototype.cleanup = function() {
      var children, _results;
      children = this.group.childNodes;
      _results = [];
      while (this._i < children.length) {
        children[this._i].setAttribute('style', 'display: none;');
        _results.push(this._i++);
      }
      return _results;
    };

    SvgLayerRenderContext.prototype._elementFactory = function(type) {
      var children, current, path;
      children = this.group.childNodes;
      if (this._i >= children.length) {
        path = _svg(type);
        this.group.appendChild(path);
        this._i++;
        return path;
      }
      current = children[this._i];
      if (current.tagName === type) {
        this._i++;
        return current;
      } else {
        path = _svg(type);
        this.group.replaceChild(path, current);
        this._i++;
        return path;
      }
    };

    return SvgLayerRenderContext;

  })(seen.RenderLayerContext);

  seen.SvgRenderContext = (function(_super) {
    __extends(SvgRenderContext, _super);

    function SvgRenderContext(svg) {
      this.svg = svg;
      SvgRenderContext.__super__.constructor.call(this);
      this.svg = seen.Util.element(this.svg);
    }

    SvgRenderContext.prototype.layer = function(layer) {
      var group;
      this.svg.appendChild(group = _svg('g'));
      this.layers.push({
        layer: layer,
        context: new seen.SvgLayerRenderContext(group)
      });
      return this;
    };

    return SvgRenderContext;

  })(seen.RenderContext);

  seen.SvgContext = function(elementId, scene) {
    var context;
    context = new seen.SvgRenderContext(elementId);
    if (scene != null) {
      context.sceneLayer(scene);
    }
    return context;
  };

  seen.CanvasStyler = (function() {
    function CanvasStyler(ctx) {
      this.ctx = ctx;
    }

    CanvasStyler.prototype.draw = function(style) {
      if (style == null) {
        style = {};
      }
      if (style.stroke != null) {
        this.ctx.strokeStyle = style.stroke;
      }
      if (style['stroke-width'] != null) {
        this.ctx.lineWidth = style['stroke-width'];
      }
      if (style['text-anchor'] != null) {
        this.ctx.textAlign = style['text-anchor'];
      }
      this.ctx.stroke();
      return this;
    };

    CanvasStyler.prototype.fill = function(style) {
      if (style == null) {
        style = {};
      }
      if (style.fill != null) {
        this.ctx.fillStyle = style.fill;
      }
      if (style['text-anchor'] != null) {
        this.ctx.textAlign = style['text-anchor'];
      }
      if (style['fill-opacity']) {
        this.ctx.globalAlpha = style['fill-opacity'];
      }
      this.ctx.fill();
      return this;
    };

    return CanvasStyler;

  })();

  seen.CanvasPathPainter = (function(_super) {
    __extends(CanvasPathPainter, _super);

    function CanvasPathPainter() {
      return CanvasPathPainter.__super__.constructor.apply(this, arguments);
    }

    CanvasPathPainter.prototype.path = function(points) {
      var i, p, _i, _len;
      this.ctx.beginPath();
      for (i = _i = 0, _len = points.length; _i < _len; i = ++_i) {
        p = points[i];
        if (i === 0) {
          this.ctx.moveTo(p.x, p.y);
        } else {
          this.ctx.lineTo(p.x, p.y);
        }
      }
      this.ctx.closePath();
      return this;
    };

    return CanvasPathPainter;

  })(seen.CanvasStyler);

  seen.CanvasRectPainter = (function(_super) {
    __extends(CanvasRectPainter, _super);

    function CanvasRectPainter() {
      return CanvasRectPainter.__super__.constructor.apply(this, arguments);
    }

    CanvasRectPainter.prototype.rect = function(width, height) {
      this.ctx.rect(0, 0, width, height);
      return this;
    };

    return CanvasRectPainter;

  })(seen.CanvasStyler);

  seen.CanvasCirclePainter = (function(_super) {
    __extends(CanvasCirclePainter, _super);

    function CanvasCirclePainter() {
      return CanvasCirclePainter.__super__.constructor.apply(this, arguments);
    }

    CanvasCirclePainter.prototype.circle = function(center, radius) {
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);
      return this;
    };

    return CanvasCirclePainter;

  })(seen.CanvasStyler);

  seen.CanvasTextPainter = (function() {
    function CanvasTextPainter(ctx) {
      this.ctx = ctx;
    }

    CanvasTextPainter.prototype.fillText = function(m, text, style) {
      if (style == null) {
        style = {};
      }
      this.ctx.save();
      this.ctx.setTransform(m[0], m[3], -m[1], -m[4], m[2], m[5]);
      if (style.font != null) {
        this.ctx.font = style.font;
      }
      if (style.fill != null) {
        this.ctx.fillStyle = style.fill;
      }
      if (style['text-anchor'] != null) {
        this.ctx.textAlign = this._cssToCanvasAnchor(style['text-anchor']);
      }
      this.ctx.fillText(text, 0, 0);
      this.ctx.restore();
      return this;
    };

    CanvasTextPainter.prototype._cssToCanvasAnchor = function(anchor) {
      if (anchor === 'middle') {
        return 'center';
      }
      return anchor;
    };

    return CanvasTextPainter;

  })();

  seen.CanvasLayerRenderContext = (function(_super) {
    __extends(CanvasLayerRenderContext, _super);

    function CanvasLayerRenderContext(ctx) {
      this.ctx = ctx;
      this.pathPainter = new seen.CanvasPathPainter(this.ctx);
      this.ciclePainter = new seen.CanvasCirclePainter(this.ctx);
      this.textPainter = new seen.CanvasTextPainter(this.ctx);
      this.rectPainter = new seen.CanvasRectPainter(this.ctx);
    }

    CanvasLayerRenderContext.prototype.path = function() {
      return this.pathPainter;
    };

    CanvasLayerRenderContext.prototype.rect = function() {
      return this.rectPainter;
    };

    CanvasLayerRenderContext.prototype.circle = function() {
      return this.ciclePainter;
    };

    CanvasLayerRenderContext.prototype.text = function() {
      return this.textPainter;
    };

    return CanvasLayerRenderContext;

  })(seen.RenderLayerContext);

  seen.CanvasRenderContext = (function(_super) {
    __extends(CanvasRenderContext, _super);

    function CanvasRenderContext(el) {
      this.el = el;
      CanvasRenderContext.__super__.constructor.call(this);
      this.el = seen.Util.element(this.el);
      this.ctx = this.el.getContext('2d');
    }

    CanvasRenderContext.prototype.layer = function(layer) {
      this.layers.push({
        layer: layer,
        context: new seen.CanvasLayerRenderContext(this.ctx)
      });
      return this;
    };

    CanvasRenderContext.prototype.reset = function() {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      return this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    };

    return CanvasRenderContext;

  })(seen.RenderContext);

  seen.CanvasContext = function(elementId, scene) {
    var context;
    context = new seen.CanvasRenderContext(elementId);
    if (scene != null) {
      context.sceneLayer(scene);
    }
    return context;
  };

  seen.WindowEvents = (function() {
    var dispatch;
    dispatch = seen.Events.dispatch('mouseMove', 'mouseDown', 'mouseUp', 'touchStart', 'touchMove', 'touchEnd', 'touchCancel');
    if (typeof window !== "undefined" && window !== null) {
      window.addEventListener('mouseup', dispatch.mouseUp, true);
      window.addEventListener('mousedown', dispatch.mouseDown, true);
      window.addEventListener('mousemove', dispatch.mouseMove, true);
      window.addEventListener('touchstart', dispatch.touchStart, true);
      window.addEventListener('touchmove', dispatch.touchMove, true);
      window.addEventListener('touchend', dispatch.touchEnd, true);
      window.addEventListener('touchcancel', dispatch.touchCancel, true);
    }
    return {
      on: dispatch.on
    };
  })();

  seen.MouseEvents = (function() {
    function MouseEvents(el, options) {
      this.el = el;
      this._onMouseWheel = __bind(this._onMouseWheel, this);
      this._onMouseUp = __bind(this._onMouseUp, this);
      this._onMouseDown = __bind(this._onMouseDown, this);
      this._onMouseMove = __bind(this._onMouseMove, this);
      seen.Util.defaults(this, options, this.defaults);
      this.el = seen.Util.element(this.el);
      this._uid = seen.Util.uniqueId('mouser-');
      this.dispatch = seen.Events.dispatch('dragStart', 'drag', 'dragEnd', 'mouseMove', 'mouseDown', 'mouseUp', 'mouseWheel');
      this.on = this.dispatch.on;
      this._mouseDown = false;
      this.attach();
    }

    MouseEvents.prototype.attach = function() {
      this.el.addEventListener('touchstart', this._onMouseDown);
      this.el.addEventListener('mousedown', this._onMouseDown);
      return this.el.addEventListener('mousewheel', this._onMouseWheel);
    };

    MouseEvents.prototype.detach = function() {
      this.el.removeEventListener('touchstart', this._onMouseDown);
      this.el.removeEventListener('mousedown', this._onMouseDown);
      return this.el.removeEventListener('mousewheel', this._onMouseWheel);
    };

    MouseEvents.prototype._onMouseMove = function(e) {
      this.dispatch.mouseMove(e);
      e.preventDefault();
      e.stopPropagation();
      if (this._mouseDown) {
        return this.dispatch.drag(e);
      }
    };

    MouseEvents.prototype._onMouseDown = function(e) {
      this._mouseDown = true;
      seen.WindowEvents.on("mouseUp." + this._uid, this._onMouseUp);
      seen.WindowEvents.on("mouseMove." + this._uid, this._onMouseMove);
      seen.WindowEvents.on("touchEnd." + this._uid, this._onMouseUp);
      seen.WindowEvents.on("touchCancel." + this._uid, this._onMouseUp);
      seen.WindowEvents.on("touchMove." + this._uid, this._onMouseMove);
      this.dispatch.mouseDown(e);
      return this.dispatch.dragStart(e);
    };

    MouseEvents.prototype._onMouseUp = function(e) {
      this._mouseDown = false;
      seen.WindowEvents.on("mouseUp." + this._uid, null);
      seen.WindowEvents.on("mouseMove." + this._uid, null);
      seen.WindowEvents.on("touchEnd." + this._uid, null);
      seen.WindowEvents.on("touchCancel." + this._uid, null);
      seen.WindowEvents.on("touchMove." + this._uid, null);
      this.dispatch.mouseUp(e);
      return this.dispatch.dragEnd(e);
    };

    MouseEvents.prototype._onMouseWheel = function(e) {
      return this.dispatch.mouseWheel(e);
    };

    return MouseEvents;

  })();

  seen.InertialMouse = (function() {
    InertialMouse.inertiaExtinction = 0.1;

    InertialMouse.smoothingTimeout = 300;

    InertialMouse.inertiaMsecDelay = 30;

    function InertialMouse() {
      this.reset();
    }

    InertialMouse.prototype.get = function() {
      var scale;
      scale = 1000 / seen.InertialMouse.inertiaMsecDelay;
      return [this.x * scale, this.y * scale];
    };

    InertialMouse.prototype.reset = function() {
      this.xy = [0, 0];
      return this;
    };

    InertialMouse.prototype.update = function(xy) {
      var msec, t;
      if (this.lastUpdate != null) {
        msec = new Date().getTime() - this.lastUpdate.getTime();
        xy = xy.map(function(x) {
          return x / Math.max(msec, 1);
        });
        t = Math.min(1, msec / seen.InertialMouse.smoothingTimeout);
        this.x = t * xy[0] + (1.0 - t) * this.x;
        this.y = t * xy[1] + (1.0 - t) * this.y;
      } else {
        this.x = xy[0], this.y = xy[1];
      }
      this.lastUpdate = new Date();
      return this;
    };

    InertialMouse.prototype.damp = function() {
      this.x *= 1.0 - seen.InertialMouse.inertiaExtinction;
      this.y *= 1.0 - seen.InertialMouse.inertiaExtinction;
      return this;
    };

    return InertialMouse;

  })();

  seen.Drag = (function() {
    Drag.prototype.defaults = {
      inertia: false
    };

    function Drag(el, options) {
      var mouser;
      this.el = el;
      this._stopInertia = __bind(this._stopInertia, this);
      this._startInertia = __bind(this._startInertia, this);
      this._onInertia = __bind(this._onInertia, this);
      this._onDrag = __bind(this._onDrag, this);
      this._onDragEnd = __bind(this._onDragEnd, this);
      this._onDragStart = __bind(this._onDragStart, this);
      this._getPageCoords = __bind(this._getPageCoords, this);
      seen.Util.defaults(this, options, this.defaults);
      this.el = seen.Util.element(this.el);
      this._uid = seen.Util.uniqueId('dragger-');
      this._inertiaRunning = false;
      this._dragState = {
        dragging: false,
        origin: null,
        last: null,
        inertia: new seen.InertialMouse()
      };
      this.dispatch = seen.Events.dispatch('drag', 'dragStart', 'dragEnd', 'dragEndInertia');
      this.on = this.dispatch.on;
      mouser = new seen.MouseEvents(this.el);
      mouser.on("dragStart." + this._uid, this._onDragStart);
      mouser.on("dragEnd." + this._uid, this._onDragEnd);
      mouser.on("drag." + this._uid, this._onDrag);
    }

    Drag.prototype._getPageCoords = function(e) {
      var _ref, _ref1;
      if (((_ref = e.touches) != null ? _ref.length : void 0) > 0) {
        return [e.touches[0].pageX, e.touches[0].pageY];
      } else if (((_ref1 = e.changedTouches) != null ? _ref1.length : void 0) > 0) {
        return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
      } else {
        return [e.pageX, e.pageY];
      }
    };

    Drag.prototype._onDragStart = function(e) {
      this._stopInertia();
      this._dragState.dragging = true;
      this._dragState.origin = this._getPageCoords(e);
      this._dragState.last = this._getPageCoords(e);
      return this.dispatch.dragStart(e);
    };

    Drag.prototype._onDragEnd = function(e) {
      var dragEvent, page;
      this._dragState.dragging = false;
      if (this.inertia) {
        page = this._getPageCoords(e);
        dragEvent = {
          offset: [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
          offsetRelative: [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]]
        };
        this._dragState.inertia.update(dragEvent.offsetRelative);
        this._startInertia();
      }
      return this.dispatch.dragEnd(e);
    };

    Drag.prototype._onDrag = function(e) {
      var dragEvent, page;
      page = this._getPageCoords(e);
      dragEvent = {
        offset: [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
        offsetRelative: [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]]
      };
      this.dispatch.drag(dragEvent);
      if (this.inertia) {
        this._dragState.inertia.update(dragEvent.offsetRelative);
      }
      return this._dragState.last = page;
    };

    Drag.prototype._onInertia = function() {
      var intertia;
      if (!this._inertiaRunning) {
        return;
      }
      intertia = this._dragState.inertia.damp().get();
      if (Math.abs(intertia[0]) < 1 && Math.abs(intertia[1]) < 1) {
        this._stopInertia();
        this.dispatch.dragEndInertia();
        return;
      }
      this.dispatch.drag({
        offset: [this._dragState.last[0] - this._dragState.origin[0], this._dragState.last[0] - this._dragState.origin[1]],
        offsetRelative: intertia
      });
      this._dragState.last = [this._dragState.last[0] + intertia[0], this._dragState.last[1] + intertia[1]];
      return this._startInertia();
    };

    Drag.prototype._startInertia = function() {
      this._inertiaRunning = true;
      return setTimeout(this._onInertia, seen.InertialMouse.inertiaMsecDelay);
    };

    Drag.prototype._stopInertia = function() {
      this._dragState.inertia.reset();
      return this._inertiaRunning = false;
    };

    return Drag;

  })();

  seen.Zoom = (function() {
    Zoom.prototype.defaults = {
      speed: 0.25
    };

    function Zoom(el, options) {
      var mouser;
      this.el = el;
      this._onMouseWheel = __bind(this._onMouseWheel, this);
      seen.Util.defaults(this, options, this.defaults);
      this.el = seen.Util.element(this.el);
      this._uid = seen.Util.uniqueId('zoomer-');
      this.dispatch = seen.Events.dispatch('zoom');
      this.on = this.dispatch.on;
      mouser = new seen.MouseEvents(this.el);
      mouser.on("mouseWheel." + this._uid, this._onMouseWheel);
    }

    Zoom.prototype._onMouseWheel = function(e) {
      var sign, zoom, zoomFactor;
      e.preventDefault();
      sign = e.wheelDelta / Math.abs(e.wheelDelta);
      zoomFactor = Math.abs(e.wheelDelta) / 120 * this.speed;
      zoom = Math.pow(2, sign * zoomFactor);
      return this.dispatch.zoom({
        zoom: zoom
      });
    };

    return Zoom;

  })();

  seen.Surface = (function() {
    Surface.prototype.cullBackfaces = true;

    Surface.prototype.fillMaterial = new seen.Material(seen.C.gray);

    Surface.prototype.strokeMaterial = null;

    function Surface(points, painter) {
      this.points = points;
      this.painter = painter != null ? painter : seen.Painters.path;
      this.id = 's' + seen.Util.uniqueId();
    }

    Surface.prototype.fill = function(fill) {
      this.fillMaterial = seen.Material.create(fill);
      return this;
    };

    Surface.prototype.stroke = function(stroke) {
      this.strokeMaterial = seen.Material.create(stroke);
      return this;
    };

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
        return s.fill(fill);
      });
      return this;
    };

    Shape.prototype.stroke = function(stroke) {
      this.eachSurface(function(s) {
        return s.stroke(stroke);
      });
      return this;
    };

    return Shape;

  })(seen.Transformable);

  seen.Model = (function(_super) {
    __extends(Model, _super);

    function Model() {
      Model.__super__.constructor.call(this);
      this.children = [];
      this.lights = [];
    }

    Model.prototype.add = function() {
      var child, childs, _i, _len;
      childs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = childs.length; _i < _len; _i++) {
        child = childs[_i];
        if (child instanceof seen.Shape || child instanceof seen.Model) {
          this.children.push(child);
        } else if (child instanceof seen.Light) {
          this.lights.push(child);
        }
      }
      return this;
    };

    Model.prototype.remove = function() {
      var child, childs, i, _i, _len, _results;
      childs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = childs.length; _i < _len; _i++) {
        child = childs[_i];
        while ((i = this.children.indexOf(child)) >= 0) {
          this.children.splice(i, 1);
        }
        _results.push((function() {
          var _results1;
          _results1 = [];
          while ((i = this.lights.indexOf(child)) >= 0) {
            _results1.push(this.lights.splice(i, 1));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Model.prototype.append = function() {
      var model;
      model = new seen.Model;
      this.add(model);
      return model;
    };

    Model.prototype.eachShape = function(f) {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child instanceof seen.Shape) {
          f.call(this, child);
        }
        if (child instanceof seen.Model) {
          _results.push(child.eachShape(f));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Model.prototype.eachRenderable = function(lightFn, shapeFn) {
      return this._eachRenderable(lightFn, shapeFn, [], this.m);
    };

    Model.prototype._eachRenderable = function(lightFn, shapeFn, lightModels, transform) {
      var child, light, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (this.lights.length > 0) {
        lightModels = lightModels.slice();
      }
      _ref = this.lights;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        light = _ref[_i];
        if (!light.enabled) {
          continue;
        }
        lightModels.push(lightFn.call(this, light, light.m.copy().multiply(transform)));
      }
      _ref1 = this.children;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        child = _ref1[_j];
        if (child instanceof seen.Shape) {
          shapeFn.call(this, child, lightModels, child.m.copy().multiply(transform));
        }
        if (child instanceof seen.Model) {
          _results.push(child._eachRenderable(lightFn, shapeFn, lightModels, child.m.copy().multiply(transform)));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Model;

  })(seen.Transformable);

  seen.Models = {
    "default": function() {
      var model;
      model = new seen.Model();
      model.add(seen.Lights.directional({
        normal: seen.P(-1, 1, 1).normalize(),
        color: seen.Colors.hsl(0.1, 0.3, 0.7),
        intensity: 0.004
      }));
      model.add(seen.Lights.directional({
        normal: seen.P(1, 1, -1).normalize(),
        intensity: 0.003
      }));
      model.add(seen.Lights.ambient({
        intensity: 0.0015
      }));
      return model;
    }
  };

  TETRAHEDRON_COORDINATE_MAP = [[0, 2, 1], [0, 1, 3], [3, 2, 0], [1, 2, 3]];

  CUBE_COORDINATE_MAP = [[0, 1, 3, 2], [5, 4, 6, 7], [1, 0, 4, 5], [2, 3, 7, 6], [3, 1, 5, 7], [0, 2, 6, 4]];

  PYRAMID_COORDINATE_MAP = [[1, 0, 2, 3], [0, 1, 4], [2, 0, 4], [3, 2, 4], [1, 3, 4]];

  EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0;

  ICOS_X = 0.525731112119133606;

  ICOS_Z = 0.850650808352039932;

  ICOSAHEDRON_POINTS = [seen.P(-ICOS_X, 0.0, -ICOS_Z), seen.P(ICOS_X, 0.0, -ICOS_Z), seen.P(-ICOS_X, 0.0, ICOS_Z), seen.P(ICOS_X, 0.0, ICOS_Z), seen.P(0.0, ICOS_Z, -ICOS_X), seen.P(0.0, ICOS_Z, ICOS_X), seen.P(0.0, -ICOS_Z, -ICOS_X), seen.P(0.0, -ICOS_Z, ICOS_X), seen.P(ICOS_Z, ICOS_X, 0.0), seen.P(-ICOS_Z, ICOS_X, 0.0), seen.P(ICOS_Z, -ICOS_X, 0.0), seen.P(-ICOS_Z, -ICOS_X, 0.0)];

  ICOSAHEDRON_COORDINATE_MAP = [[0, 4, 1], [0, 9, 4], [9, 5, 4], [4, 5, 8], [4, 8, 1], [8, 10, 1], [8, 3, 10], [5, 3, 8], [5, 2, 3], [2, 7, 3], [7, 10, 3], [7, 6, 10], [7, 11, 6], [11, 0, 6], [0, 1, 6], [6, 1, 10], [9, 0, 11], [9, 11, 2], [9, 2, 5], [7, 2, 11]];

  seen.Shapes = {
    cube: (function(_this) {
      return function() {
        var points;
        points = [seen.P(-1, -1, -1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(-1, 1, 1), seen.P(1, -1, -1), seen.P(1, -1, 1), seen.P(1, 1, -1), seen.P(1, 1, 1)];
        return new seen.Shape('cube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
      };
    })(this),
    unitcube: (function(_this) {
      return function() {
        var points;
        points = [seen.P(0, 0, 0), seen.P(0, 0, 1), seen.P(0, 1, 0), seen.P(0, 1, 1), seen.P(1, 0, 0), seen.P(1, 0, 1), seen.P(1, 1, 0), seen.P(1, 1, 1)];
        return new seen.Shape('unitcube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
      };
    })(this),
    rectangle: (function(_this) {
      return function(point1, point2) {
        var compose, points;
        compose = function(x, y, z) {
          return seen.P(x(point1.x, point2.x), y(point1.y, point2.y), z(point1.z, point2.z));
        };
        points = [compose(Math.min, Math.min, Math.min), compose(Math.min, Math.min, Math.max), compose(Math.min, Math.max, Math.min), compose(Math.min, Math.max, Math.max), compose(Math.max, Math.min, Math.min), compose(Math.max, Math.min, Math.max), compose(Math.max, Math.max, Math.min), compose(Math.max, Math.max, Math.max)];
        return new seen.Shape('rect', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
      };
    })(this),
    pyramid: (function(_this) {
      return function() {
        var points;
        points = [seen.P(0, 0, 0), seen.P(0, 0, 1), seen.P(1, 0, 0), seen.P(1, 0, 1), seen.P(0.5, 1, 0.5)];
        return new seen.Shape('pyramid', seen.Shapes.mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP));
      };
    })(this),
    tetrahedron: (function(_this) {
      return function() {
        var points;
        points = [seen.P(1, 1, 1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(1, -1, -1)];
        return new seen.Shape('tetrahedron', seen.Shapes.mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP));
      };
    })(this),
    icosahedron: function() {
      return new seen.Shape('icosahedron', seen.Shapes.mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP));
    },
    sphere: function(subdivisions) {
      var i, triangles, _i;
      if (subdivisions == null) {
        subdivisions = 2;
      }
      triangles = ICOSAHEDRON_COORDINATE_MAP.map(function(coords) {
        return coords.map(function(c) {
          return ICOSAHEDRON_POINTS[c];
        });
      });
      for (i = _i = 0; 0 <= subdivisions ? _i < subdivisions : _i > subdivisions; i = 0 <= subdivisions ? ++_i : --_i) {
        triangles = seen.Shapes._subdivideTriangles(triangles);
      }
      return new seen.Shape('sphere', triangles.map(function(triangle) {
        return new seen.Surface(triangle.map(function(v) {
          return v.copy();
        }));
      }));
    },
    patch: function(nx, ny) {
      var column, p, pts, pts0, pts1, surfaces, x, y, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1;
      if (nx == null) {
        nx = 20;
      }
      if (ny == null) {
        ny = 20;
      }
      nx = Math.round(nx);
      ny = Math.round(ny);
      surfaces = [];
      for (x = _i = 0; 0 <= nx ? _i < nx : _i > nx; x = 0 <= nx ? ++_i : --_i) {
        column = [];
        for (y = _j = 0; 0 <= ny ? _j < ny : _j > ny; y = 0 <= ny ? ++_j : --_j) {
          pts0 = [seen.P(x, y), seen.P(x + 1, y - 0.5), seen.P(x + 1, y + 0.5)];
          pts1 = [seen.P(x, y), seen.P(x + 1, y + 0.5), seen.P(x, y + 1)];
          _ref = [pts0, pts1];
          for (_k = 0, _len = _ref.length; _k < _len; _k++) {
            pts = _ref[_k];
            for (_l = 0, _len1 = pts.length; _l < _len1; _l++) {
              p = pts[_l];
              p.x *= EQUILATERAL_TRIANGLE_ALTITUDE;
              p.y += x % 2 === 0 ? 0.5 : 0;
            }
            column.push(pts);
          }
        }
        if (x % 2 !== 0) {
          _ref1 = column[0];
          for (_m = 0, _len2 = _ref1.length; _m < _len2; _m++) {
            p = _ref1[_m];
            p.y += ny;
          }
          column.push(column.shift());
        }
        surfaces = surfaces.concat(column);
      }
      return new seen.Shape('patch', surfaces.map(function(s) {
        return new seen.Surface(s);
      }));
    },
    text: function(text, surfaceOptions) {
      var key, surface, val;
      if (surfaceOptions == null) {
        surfaceOptions = {};
      }
      surface = new seen.Surface(seen.Affine.ORTHONORMAL_BASIS(), seen.Painters.text);
      surface.text = text;
      for (key in surfaceOptions) {
        val = surfaceOptions[key];
        surface[key] = val;
      }
      return new seen.Shape('text', [surface]);
    },
    extrude: function(points, offset) {
      var back, front, i, len, p, surfaces, _i, _ref;
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
          _results.push(p.add(offset));
        }
        return _results;
      })());
      for (i = _i = 1, _ref = points.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
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
      return seen.Shapes.extrude(points, seen.P(0, 0, thickness));
    },
    path: function(points) {
      return new seen.Shape('path', [new seen.Surface(points)]);
    },
    custom: function(s) {
      var f, p, surfaces, _i, _len, _ref;
      surfaces = [];
      _ref = s.surfaces;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
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
    },
    mapPointsToSurfaces: function(points, coordinateMap) {
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
    _subdivideTriangles: function(triangles) {
      var newTriangles, tri, v01, v12, v20, _i, _len;
      newTriangles = [];
      for (_i = 0, _len = triangles.length; _i < _len; _i++) {
        tri = triangles[_i];
        v01 = tri[0].copy().add(tri[1]).normalize();
        v12 = tri[1].copy().add(tri[2]).normalize();
        v20 = tri[2].copy().add(tri[0]).normalize();
        newTriangles.push([tri[0], v01, v20]);
        newTriangles.push([tri[1], v12, v01]);
        newTriangles.push([tri[2], v20, v12]);
        newTriangles.push([v01, v12, v20]);
      }
      return newTriangles;
    }
  };

  seen.ObjParser = (function() {
    function ObjParser() {
      this.vertices = [];
      this.faces = [];
      this.commands = {
        v: (function(_this) {
          return function(data) {
            return _this.vertices.push(data.map(function(d) {
              return parseFloat(d);
            }));
          };
        })(this),
        f: (function(_this) {
          return function(data) {
            return _this.faces.push(data.map(function(d) {
              return parseInt(d);
            }));
          };
        })(this)
      };
    }

    ObjParser.prototype.parse = function(contents) {
      var command, data, line, _i, _len, _ref, _results;
      _ref = contents.split(/[\r\n]+/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        data = line.trim().split(/[ ]+/);
        if (data.length < 2) {
          continue;
        }
        command = data.slice(0, 1)[0];
        data = data.slice(1);
        if (command.charAt(0) === '#') {
          continue;
        }
        if (this.commands[command] == null) {
          console.log("OBJ Parser: Skipping unknown command '" + command + "'");
          continue;
        }
        _results.push(this.commands[command](data));
      }
      return _results;
    };

    ObjParser.prototype.mapFacePoints = function(faceMap) {
      return this.faces.map((function(_this) {
        return function(face) {
          var points;
          points = face.map(function(v) {
            return seen.P.apply(seen, _this.vertices[v - 1]);
          });
          return faceMap.call(_this, points);
        };
      })(this));
    };

    return ObjParser;

  })();

  seen.Shapes.obj = function(objContents, cullBackfaces) {
    var parser;
    if (cullBackfaces == null) {
      cullBackfaces = true;
    }
    parser = new seen.ObjParser();
    parser.parse(objContents);
    return new seen.Shape('obj', parser.mapFacePoints(function(points) {
      var surface;
      surface = new seen.Surface(points);
      surface.cullBackfaces = cullBackfaces;
      return surface;
    }));
  };

  if (typeof window !== "undefined" && window !== null) {
    requestAnimationFrame = (_ref = (_ref1 = (_ref2 = window.requestAnimationFrame) != null ? _ref2 : window.mozRequestAnimationFrame) != null ? _ref1 : window.webkitRequestAnimationFrame) != null ? _ref : window.msRequestAnimationFrame;
  }

  DEFAULT_FRAME_DELAY = 30;

  seen.Animator = (function() {
    function Animator() {
      this.frame = __bind(this.frame, this);
      this.dispatch = seen.Events.dispatch('beforeFrame', 'afterFrame', 'frame');
      this.on = this.dispatch.on;
      this.timestamp = 0;
      this._running = false;
    }

    Animator.prototype.start = function(msecDelay) {
      this._running = true;
      this._msecDelay = msecDelay;
      this.animateFrame();
      return this;
    };

    Animator.prototype.stop = function() {
      this._running = false;
      return this;
    };

    Animator.prototype.animateFrame = function() {
      if ((requestAnimationFrame != null) && (this._msecDelay == null)) {
        return requestAnimationFrame(this.frame);
      } else {
        if (this._msecDelay == null) {
          this._msecDelay = DEFAULT_FRAME_DELAY;
        }
        return setTimeout(this.frame, this._msecDelay);
      }
    };

    Animator.prototype.frame = function(t) {
      var deltaTimestamp, _ref3;
      if (!this._running) {
        return;
      }
      this._timestamp = t != null ? t : this._timestamp + ((_ref3 = this._msecDelay) != null ? _ref3 : DEFAULT_FRAME_DELAY);
      deltaTimestamp = this._lastTimestamp != null ? this._timestamp - this._lastTimestamp : this._timestamp;
      this.dispatch.beforeFrame(this._timestamp, deltaTimestamp);
      this.dispatch.frame(this._timestamp, deltaTimestamp);
      this.dispatch.afterFrame(this._timestamp, deltaTimestamp);
      this._lastTimestamp = this._timestamp;
      this.animateFrame();
      return this;
    };

    Animator.prototype.onBefore = function(handler) {
      this.on("beforeFrame." + (seen.Util.uniqueId('animator-')), handler);
      return this;
    };

    Animator.prototype.onAfter = function(handler) {
      this.on("afterFrame." + (seen.Util.uniqueId('animator-')), handler);
      return this;
    };

    Animator.prototype.onFrame = function(handler) {
      this.on("frame." + (seen.Util.uniqueId('animator-')), handler);
      return this;
    };

    return Animator;

  })();

  seen.RenderAnimator = (function(_super) {
    __extends(RenderAnimator, _super);

    function RenderAnimator(context) {
      RenderAnimator.__super__.constructor.apply(this, arguments);
      this.onFrame(context.render);
    }

    return RenderAnimator;

  })(seen.Animator);

  seen.Transition = (function() {
    Transition.prototype.defaults = {
      duration: 100
    };

    function Transition(options) {
      if (options == null) {
        options = {};
      }
      seen.Util.defaults(this, options, this.defaults);
    }

    Transition.prototype.update = function(t) {
      if (this.t == null) {
        this.firstFrame();
        this.startT = t;
      }
      this.t = t;
      this.tFrac = (this.t - this.startT) / this.duration;
      this.frame();
      if (this.tFrac >= 1.0) {
        this.lastFrame();
        return false;
      }
      return true;
    };

    Transition.prototype.firstFrame = function() {};

    Transition.prototype.frame = function() {};

    Transition.prototype.lastFrame = function() {};

    return Transition;

  })();

  seen.TransitionAnimator = (function(_super) {
    __extends(TransitionAnimator, _super);

    function TransitionAnimator() {
      this.update = __bind(this.update, this);
      TransitionAnimator.__super__.constructor.apply(this, arguments);
      this.queue = [];
      this.transitions = [];
      this.onFrame(this.update);
    }

    TransitionAnimator.prototype.add = function(txn) {
      return this.transitions.push(txn);
    };

    TransitionAnimator.prototype.keyframe = function() {
      this.queue.push(this.transitions);
      return this.transitions = [];
    };

    TransitionAnimator.prototype.update = function(t) {
      var transitions;
      if (!this.queue.length) {
        return;
      }
      transitions = this.queue.shift();
      transitions = transitions.filter(function(transition) {
        return transition.update(t);
      });
      if (transitions.length) {
        return this.queue.unshift(transitions);
      }
    };

    return TransitionAnimator;

  })(seen.Animator);

  seen.Projections = {
    perspectiveFov: function(fovyInDegrees, front) {
      var tan;
      if (fovyInDegrees == null) {
        fovyInDegrees = 50;
      }
      if (front == null) {
        front = 1;
      }
      tan = front * Math.tan(fovyInDegrees * Math.PI / 360.0);
      return seen.Projections.perspective(-tan, tan, -tan, tan, front, 2 * front);
    },
    perspective: function(left, right, bottom, top, near, far) {
      var dx, dy, dz, m, near2;
      if (left == null) {
        left = -1;
      }
      if (right == null) {
        right = 1;
      }
      if (bottom == null) {
        bottom = -1;
      }
      if (top == null) {
        top = 1;
      }
      if (near == null) {
        near = 1;
      }
      if (far == null) {
        far = 100;
      }
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
      return seen.M(m);
    },
    ortho: function(left, right, bottom, top, near, far) {
      var dx, dy, dz, m, near2;
      if (left == null) {
        left = -1;
      }
      if (right == null) {
        right = 1;
      }
      if (bottom == null) {
        bottom = -1;
      }
      if (top == null) {
        top = 1;
      }
      if (near == null) {
        near = 1;
      }
      if (far == null) {
        far = 100;
      }
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
      return seen.M(m);
    }
  };

  seen.Viewports = {
    center: function(width, height, x, y) {
      var postscale, prescale;
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
      prescale = seen.M().translate(-x, -y, -height).scale(1 / width, 1 / height, 1 / height);
      postscale = seen.M().scale(width, -height, height).translate(x + width / 2, y + height / 2, height);
      return {
        prescale: prescale,
        postscale: postscale
      };
    },
    origin: function(width, height, x, y) {
      var postscale, prescale;
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
      prescale = seen.M().translate(-x, -y, -1).scale(1 / width, 1 / height, 1 / height);
      postscale = seen.M().scale(width, -height, height).translate(x, y);
      return {
        prescale: prescale,
        postscale: postscale
      };
    }
  };

  seen.Camera = (function(_super) {
    __extends(Camera, _super);

    Camera.prototype.defaults = {
      projection: seen.Projections.perspective()
    };

    function Camera(options) {
      seen.Util.defaults(this, options, this.defaults);
      Camera.__super__.constructor.apply(this, arguments);
    }

    return Camera;

  })(seen.Transformable);

  seen.Scene = (function() {
    Scene.prototype.defaults = function() {
      return {
        model: new seen.Model(),
        camera: new seen.Camera(),
        viewport: seen.Viewports.origin(1, 1),
        shader: seen.Shaders.phong(),
        cullBackfaces: true,
        fractionalPoints: false,
        cache: true
      };
    };

    function Scene(options) {
      this.flushCache = __bind(this.flushCache, this);
      this.render = __bind(this.render, this);
      seen.Util.defaults(this, options, this.defaults());
      this._renderModelCache = {};
    }

    Scene.prototype.render = function() {
      var projection, renderModels, viewport;
      projection = this.camera.m.copy().multiply(this.viewport.prescale).multiply(this.camera.projection);
      viewport = this.viewport.postscale;
      renderModels = [];
      this.model.eachRenderable(function(light, transform) {
        return new seen.LightRenderModel(light, transform);
      }, (function(_this) {
        return function(shape, lights, transform) {
          var p, renderModel, surface, _i, _j, _len, _len1, _ref3, _ref4, _ref5, _ref6, _results;
          _ref3 = shape.surfaces;
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            surface = _ref3[_i];
            renderModel = _this._renderSurface(surface, transform, projection, viewport);
            if ((!_this.cullBackfaces || !surface.cullBackfaces || renderModel.projected.normal.z < 0) && renderModel.inFrustrum) {
              renderModel.fill = (_ref4 = surface.fillMaterial) != null ? _ref4.render(lights, _this.shader, renderModel.transformed) : void 0;
              renderModel.stroke = (_ref5 = surface.strokeMaterial) != null ? _ref5.render(lights, _this.shader, renderModel.transformed) : void 0;
              if (_this.fractionalPoints !== true) {
                _ref6 = renderModel.projected.points;
                for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
                  p = _ref6[_j];
                  p.round();
                }
              }
              _results.push(renderModels.push(renderModel));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      renderModels.sort(function(a, b) {
        return b.projected.barycenter.z - a.projected.barycenter.z;
      });
      return renderModels;
    };

    Scene.prototype._renderSurface = function(surface, transform, projection, viewport) {
      var renderModel;
      if (!this.cache) {
        return new seen.RenderModel(surface, transform, projection, viewport);
      }
      renderModel = this._renderModelCache[surface.id];
      if (renderModel == null) {
        renderModel = this._renderModelCache[surface.id] = new seen.RenderModel(surface, transform, projection, viewport);
      } else {
        renderModel.update(transform, projection, viewport);
      }
      return renderModel;
    };

    Scene.prototype.flushCache = function() {
      return this._renderModelCache = {};
    };

    return Scene;

  })();

}).call(this);
