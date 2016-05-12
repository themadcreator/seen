(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("seen", [], factory);
	else if(typeof exports === 'object')
		exports["seen"] = factory();
	else
		root["seen"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/** seen.js v0.2.5 | themadcreator.github.io/seen | (c) Bill Dwyer | @license: Apache 2.0 */
	
	(function () {
	  var ARRAY_POOL,
	      Ambient,
	      CUBE_COORDINATE_MAP,
	      DEFAULT_FRAME_DELAY,
	      DEFAULT_NORMAL,
	      DiffusePhong,
	      EQUILATERAL_TRIANGLE_ALTITUDE,
	      EYE_NORMAL,
	      F3,
	      Flat,
	      G3,
	      ICOSAHEDRON_COORDINATE_MAP,
	      ICOSAHEDRON_POINTS,
	      ICOS_X,
	      ICOS_Z,
	      IDENTITY,
	      NEXT_UNIQUE_ID,
	      POINT_POOL,
	      PYRAMID_COORDINATE_MAP,
	      Phong,
	      SIMPLEX_PERMUTATIONS_TABLE,
	      TETRAHEDRON_COORDINATE_MAP,
	      TRANSPOSE_INDICES,
	      _svg,
	      grad3,
	      ref,
	      ref1,
	      ref2,
	      requestAnimationFrame,
	      seen,
	      bind = function (fn, me) {
	    return function () {
	      return fn.apply(me, arguments);
	    };
	  },
	      slice = [].slice,
	      extend = function (child, parent) {
	    for (var key in parent) {
	      if (hasProp.call(parent, key)) child[key] = parent[key];
	    }function ctor() {
	      this.constructor = child;
	    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
	  },
	      hasProp = {}.hasOwnProperty;
	
	  seen = {};
	
	  if (typeof window !== "undefined" && window !== null) {
	    window.seen = seen;
	  }
	
	  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
	    module.exports = seen;
	  }
	
	  NEXT_UNIQUE_ID = 1;
	
	  seen.Util = {
	    defaults: function (obj, opts, defaults) {
	      var prop, results;
	      for (prop in opts) {
	        if (obj[prop] == null) {
	          obj[prop] = opts[prop];
	        }
	      }
	      results = [];
	      for (prop in defaults) {
	        if (obj[prop] == null) {
	          results.push(obj[prop] = defaults[prop]);
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    },
	    arraysEqual: function (a, b) {
	      var i, len1, o, val;
	      if (!a.length === b.length) {
	        return false;
	      }
	      for (i = o = 0, len1 = a.length; o < len1; i = ++o) {
	        val = a[i];
	        if (!(val === b[i])) {
	          return false;
	        }
	      }
	      return true;
	    },
	    uniqueId: function (prefix) {
	      if (prefix == null) {
	        prefix = '';
	      }
	      return prefix + NEXT_UNIQUE_ID++;
	    },
	    element: function (elementOrString) {
	      if (typeof elementOrString === 'string') {
	        return document.getElementById(elementOrString);
	      } else {
	        return elementOrString;
	      }
	    }
	  };
	
	  seen.Events = {
	    dispatch: function () {
	      var arg, dispatch, len1, o;
	      dispatch = new seen.Events.Dispatcher();
	      for (o = 0, len1 = arguments.length; o < len1; o++) {
	        arg = arguments[o];
	        dispatch[arg] = seen.Events.Event();
	      }
	      return dispatch;
	    }
	  };
	
	  seen.Events.Dispatcher = function () {
	    function Dispatcher() {
	      this.on = bind(this.on, this);
	    }
	
	    Dispatcher.prototype.on = function (type, listener) {
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
	  }();
	
	  seen.Events.Event = function () {
	    var event;
	    event = function () {
	      var l, name, ref, results;
	      ref = event.listenerMap;
	      results = [];
	      for (name in ref) {
	        l = ref[name];
	        if (l != null) {
	          results.push(l.apply(this, arguments));
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    };
	    event.listenerMap = {};
	    event.on = function (name, listener) {
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
	
	  seen.Matrix = function () {
	    function Matrix(m1) {
	      this.m = m1 != null ? m1 : null;
	      if (this.m == null) {
	        this.m = IDENTITY.slice();
	      }
	      this.baked = IDENTITY;
	    }
	
	    Matrix.prototype.copy = function () {
	      return new seen.Matrix(this.m.slice());
	    };
	
	    Matrix.prototype.matrix = function (m) {
	      var c, i, j, o, u;
	      c = ARRAY_POOL;
	      for (j = o = 0; o < 4; j = ++o) {
	        for (i = u = 0; u < 16; i = u += 4) {
	          c[i + j] = m[i] * this.m[j] + m[i + 1] * this.m[4 + j] + m[i + 2] * this.m[8 + j] + m[i + 3] * this.m[12 + j];
	        }
	      }
	      ARRAY_POOL = this.m;
	      this.m = c;
	      return this;
	    };
	
	    Matrix.prototype.reset = function () {
	      this.m = this.baked.slice();
	      return this;
	    };
	
	    Matrix.prototype.bake = function (m) {
	      this.baked = (m != null ? m : this.m).slice();
	      return this;
	    };
	
	    Matrix.prototype.multiply = function (b) {
	      return this.matrix(b.m);
	    };
	
	    Matrix.prototype.transpose = function () {
	      var c, i, len1, o, ti;
	      c = ARRAY_POOL;
	      for (i = o = 0, len1 = TRANSPOSE_INDICES.length; o < len1; i = ++o) {
	        ti = TRANSPOSE_INDICES[i];
	        c[i] = this.m[ti];
	      }
	      ARRAY_POOL = this.m;
	      this.m = c;
	      return this;
	    };
	
	    Matrix.prototype.rotx = function (theta) {
	      var ct, rm, st;
	      ct = Math.cos(theta);
	      st = Math.sin(theta);
	      rm = [1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1];
	      return this.matrix(rm);
	    };
	
	    Matrix.prototype.roty = function (theta) {
	      var ct, rm, st;
	      ct = Math.cos(theta);
	      st = Math.sin(theta);
	      rm = [ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1];
	      return this.matrix(rm);
	    };
	
	    Matrix.prototype.rotz = function (theta) {
	      var ct, rm, st;
	      ct = Math.cos(theta);
	      st = Math.sin(theta);
	      rm = [ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	      return this.matrix(rm);
	    };
	
	    Matrix.prototype.translate = function (x, y, z) {
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
	
	    Matrix.prototype.scale = function (sx, sy, sz) {
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
	  }();
	
	  seen.M = function (m) {
	    return new seen.Matrix(m);
	  };
	
	  seen.Matrices = {
	    identity: function () {
	      return seen.M();
	    },
	    flipX: function () {
	      return seen.M().scale(-1, 1, 1);
	    },
	    flipY: function () {
	      return seen.M().scale(1, -1, 1);
	    },
	    flipZ: function () {
	      return seen.M().scale(1, 1, -1);
	    }
	  };
	
	  seen.Transformable = function () {
	    function Transformable() {
	      var fn, len1, method, o, ref;
	      this.m = new seen.Matrix();
	      this.baked = IDENTITY;
	      ref = ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset', 'bake'];
	      fn = function (_this) {
	        return function (method) {
	          return _this[method] = function () {
	            var ref1;
	            (ref1 = this.m[method]).call.apply(ref1, [this.m].concat(slice.call(arguments)));
	            return this;
	          };
	        };
	      }(this);
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        method = ref[o];
	        fn(method);
	      }
	    }
	
	    Transformable.prototype.transform = function (m) {
	      this.m.multiply(m);
	      return this;
	    };
	
	    return Transformable;
	  }();
	
	  seen.Point = function () {
	    function Point(x4, y4, z4, w1) {
	      this.x = x4 != null ? x4 : 0;
	      this.y = y4 != null ? y4 : 0;
	      this.z = z4 != null ? z4 : 0;
	      this.w = w1 != null ? w1 : 1;
	    }
	
	    Point.prototype.copy = function () {
	      return new seen.Point(this.x, this.y, this.z, this.w);
	    };
	
	    Point.prototype.set = function (p) {
	      this.x = p.x;
	      this.y = p.y;
	      this.z = p.z;
	      this.w = p.w;
	      return this;
	    };
	
	    Point.prototype.add = function (q) {
	      this.x += q.x;
	      this.y += q.y;
	      this.z += q.z;
	      return this;
	    };
	
	    Point.prototype.subtract = function (q) {
	      this.x -= q.x;
	      this.y -= q.y;
	      this.z -= q.z;
	      return this;
	    };
	
	    Point.prototype.translate = function (x, y, z) {
	      this.x += x;
	      this.y += y;
	      this.z += z;
	      return this;
	    };
	
	    Point.prototype.multiply = function (n) {
	      this.x *= n;
	      this.y *= n;
	      this.z *= n;
	      return this;
	    };
	
	    Point.prototype.divide = function (n) {
	      this.x /= n;
	      this.y /= n;
	      this.z /= n;
	      return this;
	    };
	
	    Point.prototype.round = function () {
	      this.x = Math.round(this.x);
	      this.y = Math.round(this.y);
	      this.z = Math.round(this.z);
	      return this;
	    };
	
	    Point.prototype.normalize = function () {
	      var n;
	      n = this.magnitude();
	      if (n === 0) {
	        this.set(seen.Points.Z());
	      } else {
	        this.divide(n);
	      }
	      return this;
	    };
	
	    Point.prototype.perpendicular = function () {
	      var mag, n;
	      n = this.copy().cross(seen.Points.Z());
	      mag = n.magnitude();
	      if (mag !== 0) {
	        return n.divide(mag);
	      }
	      return this.copy().cross(seen.Points.X()).normalize();
	    };
	
	    Point.prototype.transform = function (matrix) {
	      var r;
	      r = POINT_POOL;
	      r.x = this.x * matrix.m[0] + this.y * matrix.m[1] + this.z * matrix.m[2] + this.w * matrix.m[3];
	      r.y = this.x * matrix.m[4] + this.y * matrix.m[5] + this.z * matrix.m[6] + this.w * matrix.m[7];
	      r.z = this.x * matrix.m[8] + this.y * matrix.m[9] + this.z * matrix.m[10] + this.w * matrix.m[11];
	      r.w = this.x * matrix.m[12] + this.y * matrix.m[13] + this.z * matrix.m[14] + this.w * matrix.m[15];
	      this.set(r);
	      return this;
	    };
	
	    Point.prototype.magnitudeSquared = function () {
	      return this.dot(this);
	    };
	
	    Point.prototype.magnitude = function () {
	      return Math.sqrt(this.magnitudeSquared());
	    };
	
	    Point.prototype.dot = function (q) {
	      return this.x * q.x + this.y * q.y + this.z * q.z;
	    };
	
	    Point.prototype.cross = function (q) {
	      var r;
	      r = POINT_POOL;
	      r.x = this.y * q.z - this.z * q.y;
	      r.y = this.z * q.x - this.x * q.z;
	      r.z = this.x * q.y - this.y * q.x;
	      this.set(r);
	      return this;
	    };
	
	    return Point;
	  }();
	
	  seen.P = function (x, y, z, w) {
	    return new seen.Point(x, y, z, w);
	  };
	
	  POINT_POOL = seen.P();
	
	  seen.Points = {
	    X: function () {
	      return seen.P(1, 0, 0);
	    },
	    Y: function () {
	      return seen.P(0, 1, 0);
	    },
	    Z: function () {
	      return seen.P(0, 0, 1);
	    },
	    ZERO: function () {
	      return seen.P(0, 0, 0);
	    }
	  };
	
	  seen.Quaternion = function () {
	    Quaternion.pixelsPerRadian = 150;
	
	    Quaternion.xyToTransform = function (x, y) {
	      var quatX, quatY;
	      quatX = seen.Quaternion.pointAngle(seen.Points.Y(), x / seen.Quaternion.pixelsPerRadian);
	      quatY = seen.Quaternion.pointAngle(seen.Points.X(), y / seen.Quaternion.pixelsPerRadian);
	      return quatX.multiply(quatY).toMatrix();
	    };
	
	    Quaternion.axisAngle = function (x, y, z, angleRads) {
	      var scale, w;
	      scale = Math.sin(angleRads / 2.0);
	      w = Math.cos(angleRads / 2.0);
	      return new seen.Quaternion(scale * x, scale * y, scale * z, w);
	    };
	
	    Quaternion.pointAngle = function (p, angleRads) {
	      var scale, w;
	      scale = Math.sin(angleRads / 2.0);
	      w = Math.cos(angleRads / 2.0);
	      return new seen.Quaternion(scale * p.x, scale * p.y, scale * p.z, w);
	    };
	
	    function Quaternion() {
	      this.q = seen.P.apply(seen, arguments);
	    }
	
	    Quaternion.prototype.multiply = function (q) {
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
	
	    Quaternion.prototype.toMatrix = function () {
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
	  }();
	
	  seen.Bounds = function () {
	    Bounds.points = function (points) {
	      var box, len1, o, p;
	      box = new seen.Bounds();
	      for (o = 0, len1 = points.length; o < len1; o++) {
	        p = points[o];
	        box.add(p);
	      }
	      return box;
	    };
	
	    Bounds.xywh = function (x, y, w, h) {
	      return seen.Boundses.xyzwhd(x, y, 0, w, h, 0);
	    };
	
	    Bounds.xyzwhd = function (x, y, z, w, h, d) {
	      var box;
	      box = new seen.Bounds();
	      box.add(seen.P(x, y, z));
	      box.add(seen.P(x + w, y + h, z + d));
	      return box;
	    };
	
	    function Bounds() {
	      this.maxZ = bind(this.maxZ, this);
	      this.maxY = bind(this.maxY, this);
	      this.maxX = bind(this.maxX, this);
	      this.minZ = bind(this.minZ, this);
	      this.minY = bind(this.minY, this);
	      this.minX = bind(this.minX, this);
	      this.depth = bind(this.depth, this);
	      this.height = bind(this.height, this);
	      this.width = bind(this.width, this);
	      this.min = null;
	      this.max = null;
	    }
	
	    Bounds.prototype.copy = function () {
	      var box, ref, ref1;
	      box = new seen.Bounds();
	      box.min = (ref = this.min) != null ? ref.copy() : void 0;
	      box.max = (ref1 = this.max) != null ? ref1.copy() : void 0;
	      return box;
	    };
	
	    Bounds.prototype.add = function (p) {
	      if (!(this.min != null && this.max != null)) {
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
	
	    Bounds.prototype.valid = function () {
	      return this.min != null && this.max != null;
	    };
	
	    Bounds.prototype.intersect = function (box) {
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
	
	    Bounds.prototype.pad = function (x, y, z) {
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
	
	    Bounds.prototype.reset = function () {
	      this.min = null;
	      this.max = null;
	      return this;
	    };
	
	    Bounds.prototype.contains = function (p) {
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
	
	    Bounds.prototype.center = function () {
	      return seen.P(this.minX() + this.width() / 2, this.minY() + this.height() / 2, this.minZ() + this.depth() / 2);
	    };
	
	    Bounds.prototype.width = function () {
	      return this.maxX() - this.minX();
	    };
	
	    Bounds.prototype.height = function () {
	      return this.maxY() - this.minY();
	    };
	
	    Bounds.prototype.depth = function () {
	      return this.maxZ() - this.minZ();
	    };
	
	    Bounds.prototype.minX = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.min) != null ? ref1.x : void 0) != null ? ref : 0;
	    };
	
	    Bounds.prototype.minY = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.min) != null ? ref1.y : void 0) != null ? ref : 0;
	    };
	
	    Bounds.prototype.minZ = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.min) != null ? ref1.z : void 0) != null ? ref : 0;
	    };
	
	    Bounds.prototype.maxX = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.max) != null ? ref1.x : void 0) != null ? ref : 0;
	    };
	
	    Bounds.prototype.maxY = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.max) != null ? ref1.y : void 0) != null ? ref : 0;
	    };
	
	    Bounds.prototype.maxZ = function () {
	      var ref, ref1;
	      return (ref = (ref1 = this.max) != null ? ref1.z : void 0) != null ? ref : 0;
	    };
	
	    return Bounds;
	  }();
	
	  seen.Color = function () {
	    function Color(r1, g1, b1, a1) {
	      this.r = r1 != null ? r1 : 0;
	      this.g = g1 != null ? g1 : 0;
	      this.b = b1 != null ? b1 : 0;
	      this.a = a1 != null ? a1 : 0xFF;
	    }
	
	    Color.prototype.copy = function () {
	      return new seen.Color(this.r, this.g, this.b, this.a);
	    };
	
	    Color.prototype.scale = function (n) {
	      this.r *= n;
	      this.g *= n;
	      this.b *= n;
	      return this;
	    };
	
	    Color.prototype.offset = function (n) {
	      this.r += n;
	      this.g += n;
	      this.b += n;
	      return this;
	    };
	
	    Color.prototype.clamp = function (min, max) {
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
	
	    Color.prototype.minChannels = function (c) {
	      this.r = Math.min(c.r, this.r);
	      this.g = Math.min(c.g, this.g);
	      this.b = Math.min(c.b, this.b);
	      return this;
	    };
	
	    Color.prototype.addChannels = function (c) {
	      this.r += c.r;
	      this.g += c.g;
	      this.b += c.b;
	      return this;
	    };
	
	    Color.prototype.multiplyChannels = function (c) {
	      this.r *= c.r;
	      this.g *= c.g;
	      this.b *= c.b;
	      return this;
	    };
	
	    Color.prototype.hex = function () {
	      var c;
	      c = (this.r << 16 | this.g << 8 | this.b).toString(16);
	      while (c.length < 6) {
	        c = '0' + c;
	      }
	      return '#' + c;
	    };
	
	    Color.prototype.style = function () {
	      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
	    };
	
	    return Color;
	  }();
	
	  seen.Colors = {
	    CSS_RGBA_STRING_REGEX: /rgb(a)?\(([0-9.]+),([0-9.]+),*([0-9.]+)(,([0-9.]+))?\)/,
	    parse: function (str) {
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
	    rgb: function (r, g, b, a) {
	      if (a == null) {
	        a = 255;
	      }
	      return new seen.Color(r, g, b, a);
	    },
	    hex: function (hex) {
	      if (hex.charAt(0) === '#') {
	        hex = hex.substring(1);
	      }
	      return new seen.Color(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16));
	    },
	    hsl: function (h, s, l, a) {
	      var b, g, hue2rgb, p, q, r;
	      if (a == null) {
	        a = 1;
	      }
	      r = g = b = 0;
	      if (s === 0) {
	        r = g = b = l;
	      } else {
	        hue2rgb = function (p, q, t) {
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
	    randomSurfaces: function (shape, sat, lit) {
	      var len1, o, ref, results, surface;
	      if (sat == null) {
	        sat = 0.5;
	      }
	      if (lit == null) {
	        lit = 0.4;
	      }
	      ref = shape.surfaces;
	      results = [];
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        surface = ref[o];
	        results.push(surface.fill(seen.Colors.hsl(Math.random(), sat, lit)));
	      }
	      return results;
	    },
	    randomSurfaces2: function (shape, drift, sat, lit) {
	      var hue, len1, o, ref, results, surface;
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
	      ref = shape.surfaces;
	      results = [];
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        surface = ref[o];
	        hue += (Math.random() - 0.5) * drift;
	        while (hue < 0) {
	          hue += 1;
	        }
	        while (hue > 1) {
	          hue -= 1;
	        }
	        results.push(surface.fill(seen.Colors.hsl(hue, 0.5, 0.4)));
	      }
	      return results;
	    },
	    randomShape: function (shape, sat, lit) {
	      if (sat == null) {
	        sat = 0.5;
	      }
	      if (lit == null) {
	        lit = 0.4;
	      }
	      return shape.fill(new seen.Material(seen.Colors.hsl(Math.random(), sat, lit)));
	    },
	    black: function () {
	      return this.hex('#000000');
	    },
	    white: function () {
	      return this.hex('#FFFFFF');
	    },
	    gray: function () {
	      return this.hex('#888888');
	    }
	  };
	
	  seen.C = function (r, g, b, a) {
	    return new seen.Color(r, g, b, a);
	  };
	
	  seen.Material = function () {
	    Material.create = function (value) {
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
	
	    function Material(color1, options) {
	      this.color = color1;
	      if (options == null) {
	        options = {};
	      }
	      seen.Util.defaults(this, options, this.defaults);
	    }
	
	    Material.prototype.render = function (lights, shader, renderData) {
	      var color, ref, renderShader;
	      renderShader = (ref = this.shader) != null ? ref : shader;
	      color = renderShader.shade(lights, renderData, this);
	      color.a = this.color.a;
	      return color;
	    };
	
	    return Material;
	  }();
	
	  seen.Light = function (superClass) {
	    extend(Light, superClass);
	
	    Light.prototype.defaults = {
	      point: seen.P(),
	      color: seen.Colors.white(),
	      intensity: 0.01,
	      normal: seen.P(1, -1, -1).normalize(),
	      enabled: true
	    };
	
	    function Light(type1, options) {
	      this.type = type1;
	      Light.__super__.constructor.apply(this, arguments);
	      seen.Util.defaults(this, options, this.defaults);
	      this.id = seen.Util.uniqueId('l');
	    }
	
	    Light.prototype.render = function () {
	      return this.colorIntensity = this.color.copy().scale(this.intensity);
	    };
	
	    return Light;
	  }(seen.Transformable);
	
	  seen.Lights = {
	    point: function (opts) {
	      return new seen.Light('point', opts);
	    },
	    directional: function (opts) {
	      return new seen.Light('directional', opts);
	    },
	    ambient: function (opts) {
	      return new seen.Light('ambient', opts);
	    }
	  };
	
	  EYE_NORMAL = seen.Points.Z();
	
	  seen.ShaderUtils = {
	    applyDiffuse: function (c, light, lightNormal, surfaceNormal, material) {
	      var dot;
	      dot = lightNormal.dot(surfaceNormal);
	      if (dot > 0) {
	        return c.addChannels(light.colorIntensity.copy().scale(dot));
	      }
	    },
	    applyDiffuseAndSpecular: function (c, light, lightNormal, surfaceNormal, material) {
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
	    applyAmbient: function (c, light) {
	      return c.addChannels(light.colorIntensity);
	    }
	  };
	
	  seen.Shader = function () {
	    function Shader() {}
	
	    Shader.prototype.shade = function (lights, renderModel, material) {};
	
	    return Shader;
	  }();
	
	  Phong = function (superClass) {
	    extend(Phong, superClass);
	
	    function Phong() {
	      return Phong.__super__.constructor.apply(this, arguments);
	    }
	
	    Phong.prototype.shade = function (lights, renderModel, material) {
	      var c, len1, light, lightNormal, o;
	      c = new seen.Color();
	      for (o = 0, len1 = lights.length; o < len1; o++) {
	        light = lights[o];
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
	  }(seen.Shader);
	
	  DiffusePhong = function (superClass) {
	    extend(DiffusePhong, superClass);
	
	    function DiffusePhong() {
	      return DiffusePhong.__super__.constructor.apply(this, arguments);
	    }
	
	    DiffusePhong.prototype.shade = function (lights, renderModel, material) {
	      var c, len1, light, lightNormal, o;
	      c = new seen.Color();
	      for (o = 0, len1 = lights.length; o < len1; o++) {
	        light = lights[o];
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
	  }(seen.Shader);
	
	  Ambient = function (superClass) {
	    extend(Ambient, superClass);
	
	    function Ambient() {
	      return Ambient.__super__.constructor.apply(this, arguments);
	    }
	
	    Ambient.prototype.shade = function (lights, renderModel, material) {
	      var c, len1, light, o;
	      c = new seen.Color();
	      for (o = 0, len1 = lights.length; o < len1; o++) {
	        light = lights[o];
	        switch (light.type) {
	          case 'ambient':
	            seen.ShaderUtils.applyAmbient(c, light);
	        }
	      }
	      c.multiplyChannels(material.color).clamp(0, 0xFF);
	      return c;
	    };
	
	    return Ambient;
	  }(seen.Shader);
	
	  Flat = function (superClass) {
	    extend(Flat, superClass);
	
	    function Flat() {
	      return Flat.__super__.constructor.apply(this, arguments);
	    }
	
	    Flat.prototype.shade = function (lights, renderModel, material) {
	      return material.color;
	    };
	
	    return Flat;
	  }(seen.Shader);
	
	  seen.Shaders = {
	    phong: function () {
	      return new Phong();
	    },
	    diffuse: function () {
	      return new DiffusePhong();
	    },
	    ambient: function () {
	      return new Ambient();
	    },
	    flat: function () {
	      return new Flat();
	    }
	  };
	
	  seen.Affine = {
	    ORTHONORMAL_BASIS: function () {
	      return [seen.P(0, 0, 0), seen.P(20, 0, 0), seen.P(0, 20, 0)];
	    },
	    INITIAL_STATE_MATRIX: [[20, 0, 1, 0, 0, 0], [0, 20, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, 20, 0, 1], [0, 0, 0, 0, 20, 1], [0, 0, 0, 0, 0, 1]],
	    solveForAffineTransform: function (points) {
	      var A, b, i, j, n, o, ref, ref1, ref2, u, x;
	      A = seen.Affine.INITIAL_STATE_MATRIX;
	      b = [points[1].x, points[2].x, points[0].x, points[1].y, points[2].y, points[0].y];
	      x = new Array(6);
	      n = A.length;
	      for (i = o = ref = n - 1; o >= 0; i = o += -1) {
	        x[i] = b[i];
	        for (j = u = ref1 = i + 1, ref2 = n; ref1 <= ref2 ? u < ref2 : u > ref2; j = ref1 <= ref2 ? ++u : --u) {
	          x[i] -= A[i][j] * x[j];
	        }
	        x[i] /= A[i][i];
	      }
	      return x;
	    }
	  };
	
	  seen.RenderContext = function () {
	    function RenderContext() {
	      this.render = bind(this.render, this);
	      this.layers = [];
	    }
	
	    RenderContext.prototype.render = function () {
	      var layer, len1, o, ref;
	      this.reset();
	      ref = this.layers;
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        layer = ref[o];
	        layer.context.reset();
	        layer.layer.render(layer.context);
	        layer.context.cleanup();
	      }
	      this.cleanup();
	      return this;
	    };
	
	    RenderContext.prototype.animate = function () {
	      return new seen.RenderAnimator(this);
	    };
	
	    RenderContext.prototype.layer = function (layer) {
	      this.layers.push({
	        layer: layer,
	        context: this
	      });
	      return this;
	    };
	
	    RenderContext.prototype.sceneLayer = function (scene) {
	      this.layer(new seen.SceneLayer(scene));
	      return this;
	    };
	
	    RenderContext.prototype.reset = function () {};
	
	    RenderContext.prototype.cleanup = function () {};
	
	    return RenderContext;
	  }();
	
	  seen.RenderLayerContext = function () {
	    function RenderLayerContext() {}
	
	    RenderLayerContext.prototype.path = function () {};
	
	    RenderLayerContext.prototype.rect = function () {};
	
	    RenderLayerContext.prototype.circle = function () {};
	
	    RenderLayerContext.prototype.text = function () {};
	
	    RenderLayerContext.prototype.reset = function () {};
	
	    RenderLayerContext.prototype.cleanup = function () {};
	
	    return RenderLayerContext;
	  }();
	
	  seen.Context = function (elementId, scene) {
	    var context, ref, tag;
	    if (scene == null) {
	      scene = null;
	    }
	    tag = (ref = seen.Util.element(elementId)) != null ? ref.tagName.toUpperCase() : void 0;
	    context = function () {
	      switch (tag) {
	        case 'SVG':
	        case 'G':
	          return new seen.SvgRenderContext(elementId);
	        case 'CANVAS':
	          return new seen.CanvasRenderContext(elementId);
	      }
	    }();
	    if (context != null && scene != null) {
	      context.sceneLayer(scene);
	    }
	    return context;
	  };
	
	  seen.Painter = function () {
	    function Painter() {}
	
	    Painter.prototype.paint = function (renderModel, context) {};
	
	    return Painter;
	  }();
	
	  seen.PathPainter = function (superClass) {
	    extend(PathPainter, superClass);
	
	    function PathPainter() {
	      return PathPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    PathPainter.prototype.paint = function (renderModel, context) {
	      var painter, ref, ref1;
	      painter = context.path().path(renderModel.projected.points);
	      if (renderModel.fill != null) {
	        painter.fill({
	          fill: renderModel.fill == null ? 'none' : renderModel.fill.hex(),
	          'fill-opacity': ((ref = renderModel.fill) != null ? ref.a : void 0) == null ? 1.0 : renderModel.fill.a / 255.0
	        });
	      }
	      if (renderModel.stroke != null) {
	        return painter.draw({
	          fill: 'none',
	          stroke: renderModel.stroke == null ? 'none' : renderModel.stroke.hex(),
	          'stroke-width': (ref1 = renderModel.surface['stroke-width']) != null ? ref1 : 1
	        });
	      }
	    };
	
	    return PathPainter;
	  }(seen.Painter);
	
	  seen.TextPainter = function (superClass) {
	    extend(TextPainter, superClass);
	
	    function TextPainter() {
	      return TextPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    TextPainter.prototype.paint = function (renderModel, context) {
	      var ref, style, xform;
	      style = {
	        fill: renderModel.fill == null ? 'none' : renderModel.fill.hex(),
	        font: renderModel.surface.font,
	        'text-anchor': (ref = renderModel.surface.anchor) != null ? ref : 'middle'
	      };
	      xform = seen.Affine.solveForAffineTransform(renderModel.projected.points);
	      return context.text().fillText(xform, renderModel.surface.text, style);
	    };
	
	    return TextPainter;
	  }(seen.Painter);
	
	  seen.Painters = {
	    path: new seen.PathPainter(),
	    text: new seen.TextPainter()
	  };
	
	  DEFAULT_NORMAL = seen.Points.Z();
	
	  seen.RenderModel = function () {
	    function RenderModel(surface1, transform1, projection1, viewport1) {
	      this.surface = surface1;
	      this.transform = transform1;
	      this.projection = projection1;
	      this.viewport = viewport1;
	      this.points = this.surface.points;
	      this.transformed = this._initRenderData();
	      this.projected = this._initRenderData();
	      this._update();
	    }
	
	    RenderModel.prototype.update = function (transform, projection, viewport) {
	      if (!this.surface.dirty && seen.Util.arraysEqual(transform.m, this.transform.m) && seen.Util.arraysEqual(projection.m, this.projection.m) && seen.Util.arraysEqual(viewport.m, this.viewport.m)) {} else {
	        this.transform = transform;
	        this.projection = projection;
	        this.viewport = viewport;
	        return this._update();
	      }
	    };
	
	    RenderModel.prototype._update = function () {
	      var cameraSpace;
	      this._math(this.transformed, this.points, this.transform, false);
	      cameraSpace = this.transformed.points.map(function (_this) {
	        return function (p) {
	          return p.copy().transform(_this.projection);
	        };
	      }(this));
	      this.inFrustrum = this._checkFrustrum(cameraSpace);
	      this._math(this.projected, cameraSpace, this.viewport, true);
	      return this.surface.dirty = false;
	    };
	
	    RenderModel.prototype._checkFrustrum = function (points) {
	      var len1, o, p;
	      for (o = 0, len1 = points.length; o < len1; o++) {
	        p = points[o];
	        if (p.z <= -2) {
	          return false;
	        }
	      }
	      return true;
	    };
	
	    RenderModel.prototype._initRenderData = function () {
	      var p;
	      return {
	        points: function () {
	          var len1, o, ref, results;
	          ref = this.points;
	          results = [];
	          for (o = 0, len1 = ref.length; o < len1; o++) {
	            p = ref[o];
	            results.push(p.copy());
	          }
	          return results;
	        }.call(this),
	        bounds: new seen.Bounds(),
	        barycenter: seen.P(),
	        normal: seen.P(),
	        v0: seen.P(),
	        v1: seen.P()
	      };
	    };
	
	    RenderModel.prototype._math = function (set, points, transform, applyClip) {
	      var aa, i, len1, len2, len3, o, p, ref, ref1, sp, u;
	      if (applyClip == null) {
	        applyClip = false;
	      }
	      for (i = o = 0, len1 = points.length; o < len1; i = ++o) {
	        p = points[i];
	        sp = set.points[i];
	        sp.set(p).transform(transform);
	        if (applyClip) {
	          sp.divide(sp.w);
	        }
	      }
	      set.barycenter.multiply(0);
	      ref = set.points;
	      for (u = 0, len2 = ref.length; u < len2; u++) {
	        p = ref[u];
	        set.barycenter.add(p);
	      }
	      set.barycenter.divide(set.points.length);
	      set.bounds.reset();
	      ref1 = set.points;
	      for (aa = 0, len3 = ref1.length; aa < len3; aa++) {
	        p = ref1[aa];
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
	  }();
	
	  seen.LightRenderModel = function () {
	    function LightRenderModel(light1, transform) {
	      var origin;
	      this.light = light1;
	      this.colorIntensity = this.light.color.copy().scale(this.light.intensity);
	      this.type = this.light.type;
	      this.intensity = this.light.intensity;
	      this.point = this.light.point.copy().transform(transform);
	      origin = seen.Points.ZERO().transform(transform);
	      this.normal = this.light.normal.copy().transform(transform).subtract(origin).normalize();
	    }
	
	    return LightRenderModel;
	  }();
	
	  seen.RenderLayer = function () {
	    function RenderLayer() {
	      this.render = bind(this.render, this);
	    }
	
	    RenderLayer.prototype.render = function (context) {};
	
	    return RenderLayer;
	  }();
	
	  seen.SceneLayer = function (superClass) {
	    extend(SceneLayer, superClass);
	
	    function SceneLayer(scene1) {
	      this.scene = scene1;
	      this.render = bind(this.render, this);
	    }
	
	    SceneLayer.prototype.render = function (context) {
	      var len1, o, ref, renderModel, results;
	      ref = this.scene.render();
	      results = [];
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        renderModel = ref[o];
	        results.push(renderModel.surface.painter.paint(renderModel, context));
	      }
	      return results;
	    };
	
	    return SceneLayer;
	  }(seen.RenderLayer);
	
	  seen.FillLayer = function (superClass) {
	    extend(FillLayer, superClass);
	
	    function FillLayer(width1, height1, fill1) {
	      this.width = width1 != null ? width1 : 500;
	      this.height = height1 != null ? height1 : 500;
	      this.fill = fill1 != null ? fill1 : '#EEE';
	      this.render = bind(this.render, this);
	    }
	
	    FillLayer.prototype.render = function (context) {
	      return context.rect().rect(this.width, this.height).fill({
	        fill: this.fill
	      });
	    };
	
	    return FillLayer;
	  }(seen.RenderLayer);
	
	  _svg = function (name) {
	    return document.createElementNS('http://www.w3.org/2000/svg', name);
	  };
	
	  seen.SvgStyler = function () {
	    SvgStyler.prototype._attributes = {};
	
	    SvgStyler.prototype._svgTag = 'g';
	
	    function SvgStyler(elementFactory) {
	      this.elementFactory = elementFactory;
	    }
	
	    SvgStyler.prototype.clear = function () {
	      this._attributes = {};
	      return this;
	    };
	
	    SvgStyler.prototype.fill = function (style) {
	      if (style == null) {
	        style = {};
	      }
	      this._paint(style);
	      return this;
	    };
	
	    SvgStyler.prototype.draw = function (style) {
	      if (style == null) {
	        style = {};
	      }
	      this._paint(style);
	      return this;
	    };
	
	    SvgStyler.prototype._paint = function (style) {
	      var el, key, ref, str, value;
	      el = this.elementFactory(this._svgTag);
	      str = '';
	      for (key in style) {
	        value = style[key];
	        str += key + ":" + value + ";";
	      }
	      el.setAttribute('style', str);
	      ref = this._attributes;
	      for (key in ref) {
	        value = ref[key];
	        el.setAttribute(key, value);
	      }
	      return el;
	    };
	
	    return SvgStyler;
	  }();
	
	  seen.SvgPathPainter = function (superClass) {
	    extend(SvgPathPainter, superClass);
	
	    function SvgPathPainter() {
	      return SvgPathPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    SvgPathPainter.prototype._svgTag = 'path';
	
	    SvgPathPainter.prototype.path = function (points) {
	      this._attributes.d = 'M' + points.map(function (p) {
	        return p.x + " " + p.y;
	      }).join('L');
	      return this;
	    };
	
	    return SvgPathPainter;
	  }(seen.SvgStyler);
	
	  seen.SvgTextPainter = function () {
	    SvgTextPainter.prototype._svgTag = 'text';
	
	    function SvgTextPainter(elementFactory) {
	      this.elementFactory = elementFactory;
	    }
	
	    SvgTextPainter.prototype.fillText = function (m, text, style) {
	      var el, key, str, value;
	      if (style == null) {
	        style = {};
	      }
	      el = this.elementFactory(this._svgTag);
	      el.setAttribute('transform', "matrix(" + m[0] + " " + m[3] + " " + -m[1] + " " + -m[4] + " " + m[2] + " " + m[5] + ")");
	      str = '';
	      for (key in style) {
	        value = style[key];
	        if (value != null) {
	          str += key + ":" + value + ";";
	        }
	      }
	      el.setAttribute('style', str);
	      return el.textContent = text;
	    };
	
	    return SvgTextPainter;
	  }();
	
	  seen.SvgRectPainter = function (superClass) {
	    extend(SvgRectPainter, superClass);
	
	    function SvgRectPainter() {
	      return SvgRectPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    SvgRectPainter.prototype._svgTag = 'rect';
	
	    SvgRectPainter.prototype.rect = function (width, height) {
	      this._attributes.width = width;
	      this._attributes.height = height;
	      return this;
	    };
	
	    return SvgRectPainter;
	  }(seen.SvgStyler);
	
	  seen.SvgCirclePainter = function (superClass) {
	    extend(SvgCirclePainter, superClass);
	
	    function SvgCirclePainter() {
	      return SvgCirclePainter.__super__.constructor.apply(this, arguments);
	    }
	
	    SvgCirclePainter.prototype._svgTag = 'circle';
	
	    SvgCirclePainter.prototype.circle = function (center, radius) {
	      this._attributes.cx = center.x;
	      this._attributes.cy = center.y;
	      this._attributes.r = radius;
	      return this;
	    };
	
	    return SvgCirclePainter;
	  }(seen.SvgStyler);
	
	  seen.SvgLayerRenderContext = function (superClass) {
	    extend(SvgLayerRenderContext, superClass);
	
	    function SvgLayerRenderContext(group1) {
	      this.group = group1;
	      this._elementFactory = bind(this._elementFactory, this);
	      this.pathPainter = new seen.SvgPathPainter(this._elementFactory);
	      this.textPainter = new seen.SvgTextPainter(this._elementFactory);
	      this.circlePainter = new seen.SvgCirclePainter(this._elementFactory);
	      this.rectPainter = new seen.SvgRectPainter(this._elementFactory);
	      this._i = 0;
	    }
	
	    SvgLayerRenderContext.prototype.path = function () {
	      return this.pathPainter.clear();
	    };
	
	    SvgLayerRenderContext.prototype.rect = function () {
	      return this.rectPainter.clear();
	    };
	
	    SvgLayerRenderContext.prototype.circle = function () {
	      return this.circlePainter.clear();
	    };
	
	    SvgLayerRenderContext.prototype.text = function () {
	      return this.textPainter;
	    };
	
	    SvgLayerRenderContext.prototype.reset = function () {
	      return this._i = 0;
	    };
	
	    SvgLayerRenderContext.prototype.cleanup = function () {
	      var children, results;
	      children = this.group.childNodes;
	      results = [];
	      while (this._i < children.length) {
	        children[this._i].setAttribute('style', 'display: none;');
	        results.push(this._i++);
	      }
	      return results;
	    };
	
	    SvgLayerRenderContext.prototype._elementFactory = function (type) {
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
	  }(seen.RenderLayerContext);
	
	  seen.SvgRenderContext = function (superClass) {
	    extend(SvgRenderContext, superClass);
	
	    function SvgRenderContext(svg) {
	      this.svg = svg;
	      SvgRenderContext.__super__.constructor.call(this);
	      this.svg = seen.Util.element(this.svg);
	    }
	
	    SvgRenderContext.prototype.layer = function (layer) {
	      var group;
	      this.svg.appendChild(group = _svg('g'));
	      this.layers.push({
	        layer: layer,
	        context: new seen.SvgLayerRenderContext(group)
	      });
	      return this;
	    };
	
	    return SvgRenderContext;
	  }(seen.RenderContext);
	
	  seen.SvgContext = function (elementId, scene) {
	    var context;
	    context = new seen.SvgRenderContext(elementId);
	    if (scene != null) {
	      context.sceneLayer(scene);
	    }
	    return context;
	  };
	
	  seen.CanvasStyler = function () {
	    function CanvasStyler(ctx) {
	      this.ctx = ctx;
	    }
	
	    CanvasStyler.prototype.draw = function (style) {
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
	
	    CanvasStyler.prototype.fill = function (style) {
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
	  }();
	
	  seen.CanvasPathPainter = function (superClass) {
	    extend(CanvasPathPainter, superClass);
	
	    function CanvasPathPainter() {
	      return CanvasPathPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    CanvasPathPainter.prototype.path = function (points) {
	      var i, len1, o, p;
	      this.ctx.beginPath();
	      for (i = o = 0, len1 = points.length; o < len1; i = ++o) {
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
	  }(seen.CanvasStyler);
	
	  seen.CanvasRectPainter = function (superClass) {
	    extend(CanvasRectPainter, superClass);
	
	    function CanvasRectPainter() {
	      return CanvasRectPainter.__super__.constructor.apply(this, arguments);
	    }
	
	    CanvasRectPainter.prototype.rect = function (width, height) {
	      this.ctx.rect(0, 0, width, height);
	      return this;
	    };
	
	    return CanvasRectPainter;
	  }(seen.CanvasStyler);
	
	  seen.CanvasCirclePainter = function (superClass) {
	    extend(CanvasCirclePainter, superClass);
	
	    function CanvasCirclePainter() {
	      return CanvasCirclePainter.__super__.constructor.apply(this, arguments);
	    }
	
	    CanvasCirclePainter.prototype.circle = function (center, radius) {
	      this.ctx.beginPath();
	      this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);
	      return this;
	    };
	
	    return CanvasCirclePainter;
	  }(seen.CanvasStyler);
	
	  seen.CanvasTextPainter = function () {
	    function CanvasTextPainter(ctx) {
	      this.ctx = ctx;
	    }
	
	    CanvasTextPainter.prototype.fillText = function (m, text, style) {
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
	
	    CanvasTextPainter.prototype._cssToCanvasAnchor = function (anchor) {
	      if (anchor === 'middle') {
	        return 'center';
	      }
	      return anchor;
	    };
	
	    return CanvasTextPainter;
	  }();
	
	  seen.CanvasLayerRenderContext = function (superClass) {
	    extend(CanvasLayerRenderContext, superClass);
	
	    function CanvasLayerRenderContext(ctx) {
	      this.ctx = ctx;
	      this.pathPainter = new seen.CanvasPathPainter(this.ctx);
	      this.ciclePainter = new seen.CanvasCirclePainter(this.ctx);
	      this.textPainter = new seen.CanvasTextPainter(this.ctx);
	      this.rectPainter = new seen.CanvasRectPainter(this.ctx);
	    }
	
	    CanvasLayerRenderContext.prototype.path = function () {
	      return this.pathPainter;
	    };
	
	    CanvasLayerRenderContext.prototype.rect = function () {
	      return this.rectPainter;
	    };
	
	    CanvasLayerRenderContext.prototype.circle = function () {
	      return this.ciclePainter;
	    };
	
	    CanvasLayerRenderContext.prototype.text = function () {
	      return this.textPainter;
	    };
	
	    return CanvasLayerRenderContext;
	  }(seen.RenderLayerContext);
	
	  seen.CanvasRenderContext = function (superClass) {
	    extend(CanvasRenderContext, superClass);
	
	    function CanvasRenderContext(el1) {
	      this.el = el1;
	      CanvasRenderContext.__super__.constructor.call(this);
	      this.el = seen.Util.element(this.el);
	      this.ctx = this.el.getContext('2d');
	    }
	
	    CanvasRenderContext.prototype.layer = function (layer) {
	      this.layers.push({
	        layer: layer,
	        context: new seen.CanvasLayerRenderContext(this.ctx)
	      });
	      return this;
	    };
	
	    CanvasRenderContext.prototype.reset = function () {
	      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	      return this.ctx.clearRect(0, 0, this.el.width, this.el.height);
	    };
	
	    return CanvasRenderContext;
	  }(seen.RenderContext);
	
	  seen.CanvasContext = function (elementId, scene) {
	    var context;
	    context = new seen.CanvasRenderContext(elementId);
	    if (scene != null) {
	      context.sceneLayer(scene);
	    }
	    return context;
	  };
	
	  seen.WindowEvents = function () {
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
	  }();
	
	  seen.MouseEvents = function () {
	    function MouseEvents(el1, options) {
	      this.el = el1;
	      this._onMouseWheel = bind(this._onMouseWheel, this);
	      this._onMouseUp = bind(this._onMouseUp, this);
	      this._onMouseDown = bind(this._onMouseDown, this);
	      this._onMouseMove = bind(this._onMouseMove, this);
	      seen.Util.defaults(this, options, this.defaults);
	      this.el = seen.Util.element(this.el);
	      this._uid = seen.Util.uniqueId('mouser-');
	      this.dispatch = seen.Events.dispatch('dragStart', 'drag', 'dragEnd', 'mouseMove', 'mouseDown', 'mouseUp', 'mouseWheel');
	      this.on = this.dispatch.on;
	      this._mouseDown = false;
	      this.attach();
	    }
	
	    MouseEvents.prototype.attach = function () {
	      this.el.addEventListener('touchstart', this._onMouseDown);
	      this.el.addEventListener('mousedown', this._onMouseDown);
	      return this.el.addEventListener('mousewheel', this._onMouseWheel);
	    };
	
	    MouseEvents.prototype.detach = function () {
	      this.el.removeEventListener('touchstart', this._onMouseDown);
	      this.el.removeEventListener('mousedown', this._onMouseDown);
	      return this.el.removeEventListener('mousewheel', this._onMouseWheel);
	    };
	
	    MouseEvents.prototype._onMouseMove = function (e) {
	      this.dispatch.mouseMove(e);
	      e.preventDefault();
	      e.stopPropagation();
	      if (this._mouseDown) {
	        return this.dispatch.drag(e);
	      }
	    };
	
	    MouseEvents.prototype._onMouseDown = function (e) {
	      this._mouseDown = true;
	      seen.WindowEvents.on("mouseUp." + this._uid, this._onMouseUp);
	      seen.WindowEvents.on("mouseMove." + this._uid, this._onMouseMove);
	      seen.WindowEvents.on("touchEnd." + this._uid, this._onMouseUp);
	      seen.WindowEvents.on("touchCancel." + this._uid, this._onMouseUp);
	      seen.WindowEvents.on("touchMove." + this._uid, this._onMouseMove);
	      this.dispatch.mouseDown(e);
	      return this.dispatch.dragStart(e);
	    };
	
	    MouseEvents.prototype._onMouseUp = function (e) {
	      this._mouseDown = false;
	      seen.WindowEvents.on("mouseUp." + this._uid, null);
	      seen.WindowEvents.on("mouseMove." + this._uid, null);
	      seen.WindowEvents.on("touchEnd." + this._uid, null);
	      seen.WindowEvents.on("touchCancel." + this._uid, null);
	      seen.WindowEvents.on("touchMove." + this._uid, null);
	      this.dispatch.mouseUp(e);
	      return this.dispatch.dragEnd(e);
	    };
	
	    MouseEvents.prototype._onMouseWheel = function (e) {
	      return this.dispatch.mouseWheel(e);
	    };
	
	    return MouseEvents;
	  }();
	
	  seen.InertialMouse = function () {
	    InertialMouse.inertiaExtinction = 0.1;
	
	    InertialMouse.smoothingTimeout = 300;
	
	    InertialMouse.inertiaMsecDelay = 30;
	
	    function InertialMouse() {
	      this.reset();
	    }
	
	    InertialMouse.prototype.get = function () {
	      var scale;
	      scale = 1000 / seen.InertialMouse.inertiaMsecDelay;
	      return [this.x * scale, this.y * scale];
	    };
	
	    InertialMouse.prototype.reset = function () {
	      this.xy = [0, 0];
	      return this;
	    };
	
	    InertialMouse.prototype.update = function (xy) {
	      var msec, t;
	      if (this.lastUpdate != null) {
	        msec = new Date().getTime() - this.lastUpdate.getTime();
	        xy = xy.map(function (x) {
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
	
	    InertialMouse.prototype.damp = function () {
	      this.x *= 1.0 - seen.InertialMouse.inertiaExtinction;
	      this.y *= 1.0 - seen.InertialMouse.inertiaExtinction;
	      return this;
	    };
	
	    return InertialMouse;
	  }();
	
	  seen.Drag = function () {
	    Drag.prototype.defaults = {
	      inertia: false
	    };
	
	    function Drag(el1, options) {
	      var mouser;
	      this.el = el1;
	      this._stopInertia = bind(this._stopInertia, this);
	      this._startInertia = bind(this._startInertia, this);
	      this._onInertia = bind(this._onInertia, this);
	      this._onDrag = bind(this._onDrag, this);
	      this._onDragEnd = bind(this._onDragEnd, this);
	      this._onDragStart = bind(this._onDragStart, this);
	      this._getPageCoords = bind(this._getPageCoords, this);
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
	
	    Drag.prototype._getPageCoords = function (e) {
	      var ref, ref1;
	      if (((ref = e.touches) != null ? ref.length : void 0) > 0) {
	        return [e.touches[0].pageX, e.touches[0].pageY];
	      } else if (((ref1 = e.changedTouches) != null ? ref1.length : void 0) > 0) {
	        return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
	      } else {
	        return [e.pageX, e.pageY];
	      }
	    };
	
	    Drag.prototype._onDragStart = function (e) {
	      this._stopInertia();
	      this._dragState.dragging = true;
	      this._dragState.origin = this._getPageCoords(e);
	      this._dragState.last = this._getPageCoords(e);
	      return this.dispatch.dragStart(e);
	    };
	
	    Drag.prototype._onDragEnd = function (e) {
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
	
	    Drag.prototype._onDrag = function (e) {
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
	
	    Drag.prototype._onInertia = function () {
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
	
	    Drag.prototype._startInertia = function () {
	      this._inertiaRunning = true;
	      return setTimeout(this._onInertia, seen.InertialMouse.inertiaMsecDelay);
	    };
	
	    Drag.prototype._stopInertia = function () {
	      this._dragState.inertia.reset();
	      return this._inertiaRunning = false;
	    };
	
	    return Drag;
	  }();
	
	  seen.Zoom = function () {
	    Zoom.prototype.defaults = {
	      speed: 0.25
	    };
	
	    function Zoom(el1, options) {
	      var mouser;
	      this.el = el1;
	      this._onMouseWheel = bind(this._onMouseWheel, this);
	      seen.Util.defaults(this, options, this.defaults);
	      this.el = seen.Util.element(this.el);
	      this._uid = seen.Util.uniqueId('zoomer-');
	      this.dispatch = seen.Events.dispatch('zoom');
	      this.on = this.dispatch.on;
	      mouser = new seen.MouseEvents(this.el);
	      mouser.on("mouseWheel." + this._uid, this._onMouseWheel);
	    }
	
	    Zoom.prototype._onMouseWheel = function (e) {
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
	  }();
	
	  seen.Surface = function () {
	    Surface.prototype.cullBackfaces = true;
	
	    Surface.prototype.fillMaterial = new seen.Material(seen.C.gray);
	
	    Surface.prototype.strokeMaterial = null;
	
	    function Surface(points1, painter1) {
	      this.points = points1;
	      this.painter = painter1 != null ? painter1 : seen.Painters.path;
	      this.id = 's' + seen.Util.uniqueId();
	    }
	
	    Surface.prototype.fill = function (fill) {
	      this.fillMaterial = seen.Material.create(fill);
	      return this;
	    };
	
	    Surface.prototype.stroke = function (stroke) {
	      this.strokeMaterial = seen.Material.create(stroke);
	      return this;
	    };
	
	    return Surface;
	  }();
	
	  seen.Shape = function (superClass) {
	    extend(Shape, superClass);
	
	    function Shape(type1, surfaces1) {
	      this.type = type1;
	      this.surfaces = surfaces1;
	      Shape.__super__.constructor.call(this);
	    }
	
	    Shape.prototype.eachSurface = function (f) {
	      this.surfaces.forEach(f);
	      return this;
	    };
	
	    Shape.prototype.fill = function (fill) {
	      this.eachSurface(function (s) {
	        return s.fill(fill);
	      });
	      return this;
	    };
	
	    Shape.prototype.stroke = function (stroke) {
	      this.eachSurface(function (s) {
	        return s.stroke(stroke);
	      });
	      return this;
	    };
	
	    return Shape;
	  }(seen.Transformable);
	
	  seen.Model = function (superClass) {
	    extend(Model, superClass);
	
	    function Model() {
	      Model.__super__.constructor.call(this);
	      this.children = [];
	      this.lights = [];
	    }
	
	    Model.prototype.add = function () {
	      var child, childs, len1, o;
	      childs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	      for (o = 0, len1 = childs.length; o < len1; o++) {
	        child = childs[o];
	        if (child instanceof seen.Shape || child instanceof seen.Model) {
	          this.children.push(child);
	        } else if (child instanceof seen.Light) {
	          this.lights.push(child);
	        }
	      }
	      return this;
	    };
	
	    Model.prototype.remove = function () {
	      var child, childs, i, len1, o, results;
	      childs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	      results = [];
	      for (o = 0, len1 = childs.length; o < len1; o++) {
	        child = childs[o];
	        while ((i = this.children.indexOf(child)) >= 0) {
	          this.children.splice(i, 1);
	        }
	        results.push(function () {
	          var results1;
	          results1 = [];
	          while ((i = this.lights.indexOf(child)) >= 0) {
	            results1.push(this.lights.splice(i, 1));
	          }
	          return results1;
	        }.call(this));
	      }
	      return results;
	    };
	
	    Model.prototype.append = function () {
	      var model;
	      model = new seen.Model();
	      this.add(model);
	      return model;
	    };
	
	    Model.prototype.eachShape = function (f) {
	      var child, len1, o, ref, results;
	      ref = this.children;
	      results = [];
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        child = ref[o];
	        if (child instanceof seen.Shape) {
	          f.call(this, child);
	        }
	        if (child instanceof seen.Model) {
	          results.push(child.eachShape(f));
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    };
	
	    Model.prototype.eachRenderable = function (lightFn, shapeFn) {
	      return this._eachRenderable(lightFn, shapeFn, [], this.m);
	    };
	
	    Model.prototype._eachRenderable = function (lightFn, shapeFn, lightModels, transform) {
	      var child, len1, len2, light, o, ref, ref1, results, u;
	      if (this.lights.length > 0) {
	        lightModels = lightModels.slice();
	      }
	      ref = this.lights;
	      for (o = 0, len1 = ref.length; o < len1; o++) {
	        light = ref[o];
	        if (!light.enabled) {
	          continue;
	        }
	        lightModels.push(lightFn.call(this, light, light.m.copy().multiply(transform)));
	      }
	      ref1 = this.children;
	      results = [];
	      for (u = 0, len2 = ref1.length; u < len2; u++) {
	        child = ref1[u];
	        if (child instanceof seen.Shape) {
	          shapeFn.call(this, child, lightModels, child.m.copy().multiply(transform));
	        }
	        if (child instanceof seen.Model) {
	          results.push(child._eachRenderable(lightFn, shapeFn, lightModels, child.m.copy().multiply(transform)));
	        } else {
	          results.push(void 0);
	        }
	      }
	      return results;
	    };
	
	    return Model;
	  }(seen.Transformable);
	
	  seen.Models = {
	    "default": function () {
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
	
	  if (typeof window !== "undefined" && window !== null) {
	    requestAnimationFrame = (ref = (ref1 = (ref2 = window.requestAnimationFrame) != null ? ref2 : window.mozRequestAnimationFrame) != null ? ref1 : window.webkitRequestAnimationFrame) != null ? ref : window.msRequestAnimationFrame;
	  }
	
	  DEFAULT_FRAME_DELAY = 30;
	
	  seen.Animator = function () {
	    function Animator() {
	      this.frame = bind(this.frame, this);
	      this.dispatch = seen.Events.dispatch('beforeFrame', 'afterFrame', 'frame');
	      this.on = this.dispatch.on;
	      this.timestamp = 0;
	      this._running = false;
	      this.frameDelay = null;
	    }
	
	    Animator.prototype.start = function () {
	      this._running = true;
	      if (this.frameDelay != null) {
	        this._lastTime = new Date().valueOf();
	        this._delayCompensation = 0;
	      }
	      this.animateFrame();
	      return this;
	    };
	
	    Animator.prototype.stop = function () {
	      this._running = false;
	      return this;
	    };
	
	    Animator.prototype.animateFrame = function () {
	      var delta, frameDelay, ref3;
	      if (requestAnimationFrame != null && this.frameDelay == null) {
	        requestAnimationFrame(this.frame);
	      } else {
	        delta = new Date().valueOf() - this._lastTime;
	        this._lastTime += delta;
	        this._delayCompensation += delta;
	        frameDelay = (ref3 = this.frameDelay) != null ? ref3 : DEFAULT_FRAME_DELAY;
	        setTimeout(this.frame, frameDelay - this._delayCompensation);
	      }
	      return this;
	    };
	
	    Animator.prototype.frame = function (t) {
	      var deltaTimestamp, ref3;
	      if (!this._running) {
	        return;
	      }
	      this._timestamp = t != null ? t : this._timestamp + ((ref3 = this._msecDelay) != null ? ref3 : DEFAULT_FRAME_DELAY);
	      deltaTimestamp = this._lastTimestamp != null ? this._timestamp - this._lastTimestamp : this._timestamp;
	      this.dispatch.beforeFrame(this._timestamp, deltaTimestamp);
	      this.dispatch.frame(this._timestamp, deltaTimestamp);
	      this.dispatch.afterFrame(this._timestamp, deltaTimestamp);
	      this._lastTimestamp = this._timestamp;
	      this.animateFrame();
	      return this;
	    };
	
	    Animator.prototype.onBefore = function (handler) {
	      this.on("beforeFrame." + seen.Util.uniqueId('animator-'), handler);
	      return this;
	    };
	
	    Animator.prototype.onAfter = function (handler) {
	      this.on("afterFrame." + seen.Util.uniqueId('animator-'), handler);
	      return this;
	    };
	
	    Animator.prototype.onFrame = function (handler) {
	      this.on("frame." + seen.Util.uniqueId('animator-'), handler);
	      return this;
	    };
	
	    return Animator;
	  }();
	
	  seen.RenderAnimator = function (superClass) {
	    extend(RenderAnimator, superClass);
	
	    function RenderAnimator(context) {
	      RenderAnimator.__super__.constructor.apply(this, arguments);
	      this.onFrame(context.render);
	    }
	
	    return RenderAnimator;
	  }(seen.Animator);
	
	  seen.Transition = function () {
	    Transition.prototype.defaults = {
	      duration: 100
	    };
	
	    function Transition(options) {
	      if (options == null) {
	        options = {};
	      }
	      seen.Util.defaults(this, options, this.defaults);
	    }
	
	    Transition.prototype.update = function (t) {
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
	
	    Transition.prototype.firstFrame = function () {};
	
	    Transition.prototype.frame = function () {};
	
	    Transition.prototype.lastFrame = function () {};
	
	    return Transition;
	  }();
	
	  seen.TransitionAnimator = function (superClass) {
	    extend(TransitionAnimator, superClass);
	
	    function TransitionAnimator() {
	      this.update = bind(this.update, this);
	      TransitionAnimator.__super__.constructor.apply(this, arguments);
	      this.queue = [];
	      this.transitions = [];
	      this.onFrame(this.update);
	    }
	
	    TransitionAnimator.prototype.add = function (txn) {
	      return this.transitions.push(txn);
	    };
	
	    TransitionAnimator.prototype.keyframe = function () {
	      this.queue.push(this.transitions);
	      return this.transitions = [];
	    };
	
	    TransitionAnimator.prototype.update = function (t) {
	      var transitions;
	      if (!this.queue.length) {
	        return;
	      }
	      transitions = this.queue.shift();
	      transitions = transitions.filter(function (transition) {
	        return transition.update(t);
	      });
	      if (transitions.length) {
	        return this.queue.unshift(transitions);
	      }
	    };
	
	    return TransitionAnimator;
	  }(seen.Animator);
	
	  TETRAHEDRON_COORDINATE_MAP = [[0, 2, 1], [0, 1, 3], [3, 2, 0], [1, 2, 3]];
	
	  CUBE_COORDINATE_MAP = [[0, 1, 3, 2], [5, 4, 6, 7], [1, 0, 4, 5], [2, 3, 7, 6], [3, 1, 5, 7], [0, 2, 6, 4]];
	
	  PYRAMID_COORDINATE_MAP = [[1, 0, 2, 3], [0, 1, 4], [2, 0, 4], [3, 2, 4], [1, 3, 4]];
	
	  EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0;
	
	  ICOS_X = 0.525731112119133606;
	
	  ICOS_Z = 0.850650808352039932;
	
	  ICOSAHEDRON_POINTS = [seen.P(-ICOS_X, 0.0, -ICOS_Z), seen.P(ICOS_X, 0.0, -ICOS_Z), seen.P(-ICOS_X, 0.0, ICOS_Z), seen.P(ICOS_X, 0.0, ICOS_Z), seen.P(0.0, ICOS_Z, -ICOS_X), seen.P(0.0, ICOS_Z, ICOS_X), seen.P(0.0, -ICOS_Z, -ICOS_X), seen.P(0.0, -ICOS_Z, ICOS_X), seen.P(ICOS_Z, ICOS_X, 0.0), seen.P(-ICOS_Z, ICOS_X, 0.0), seen.P(ICOS_Z, -ICOS_X, 0.0), seen.P(-ICOS_Z, -ICOS_X, 0.0)];
	
	  ICOSAHEDRON_COORDINATE_MAP = [[0, 4, 1], [0, 9, 4], [9, 5, 4], [4, 5, 8], [4, 8, 1], [8, 10, 1], [8, 3, 10], [5, 3, 8], [5, 2, 3], [2, 7, 3], [7, 10, 3], [7, 6, 10], [7, 11, 6], [11, 0, 6], [0, 1, 6], [6, 1, 10], [9, 0, 11], [9, 11, 2], [9, 2, 5], [7, 2, 11]];
	
	  seen.Shapes = {
	    cube: function (_this) {
	      return function () {
	        var points;
	        points = [seen.P(-1, -1, -1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(-1, 1, 1), seen.P(1, -1, -1), seen.P(1, -1, 1), seen.P(1, 1, -1), seen.P(1, 1, 1)];
	        return new seen.Shape('cube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
	      };
	    }(this),
	    unitcube: function (_this) {
	      return function () {
	        var points;
	        points = [seen.P(0, 0, 0), seen.P(0, 0, 1), seen.P(0, 1, 0), seen.P(0, 1, 1), seen.P(1, 0, 0), seen.P(1, 0, 1), seen.P(1, 1, 0), seen.P(1, 1, 1)];
	        return new seen.Shape('unitcube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
	      };
	    }(this),
	    rectangle: function (_this) {
	      return function (point1, point2) {
	        var compose, points;
	        compose = function (x, y, z) {
	          return seen.P(x(point1.x, point2.x), y(point1.y, point2.y), z(point1.z, point2.z));
	        };
	        points = [compose(Math.min, Math.min, Math.min), compose(Math.min, Math.min, Math.max), compose(Math.min, Math.max, Math.min), compose(Math.min, Math.max, Math.max), compose(Math.max, Math.min, Math.min), compose(Math.max, Math.min, Math.max), compose(Math.max, Math.max, Math.min), compose(Math.max, Math.max, Math.max)];
	        return new seen.Shape('rect', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
	      };
	    }(this),
	    pyramid: function (_this) {
	      return function () {
	        var points;
	        points = [seen.P(0, 0, 0), seen.P(0, 0, 1), seen.P(1, 0, 0), seen.P(1, 0, 1), seen.P(0.5, 1, 0.5)];
	        return new seen.Shape('pyramid', seen.Shapes.mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP));
	      };
	    }(this),
	    tetrahedron: function (_this) {
	      return function () {
	        var points;
	        points = [seen.P(1, 1, 1), seen.P(-1, -1, 1), seen.P(-1, 1, -1), seen.P(1, -1, -1)];
	        return new seen.Shape('tetrahedron', seen.Shapes.mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP));
	      };
	    }(this),
	    icosahedron: function () {
	      return new seen.Shape('icosahedron', seen.Shapes.mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP));
	    },
	    sphere: function (subdivisions) {
	      var i, o, ref3, triangles;
	      if (subdivisions == null) {
	        subdivisions = 2;
	      }
	      triangles = ICOSAHEDRON_COORDINATE_MAP.map(function (coords) {
	        return coords.map(function (c) {
	          return ICOSAHEDRON_POINTS[c];
	        });
	      });
	      for (i = o = 0, ref3 = subdivisions; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
	        triangles = seen.Shapes._subdivideTriangles(triangles);
	      }
	      return new seen.Shape('sphere', triangles.map(function (triangle) {
	        return new seen.Surface(triangle.map(function (v) {
	          return v.copy();
	        }));
	      }));
	    },
	    pipe: function (point1, point2, radius, segments) {
	      var axis, o, perp, points, quat, results, theta;
	      if (radius == null) {
	        radius = 1;
	      }
	      if (segments == null) {
	        segments = 8;
	      }
	      axis = point2.copy().subtract(point1);
	      perp = axis.perpendicular().multiply(radius);
	      theta = -Math.PI * 2.0 / segments;
	      quat = seen.Quaternion.pointAngle(axis.copy().normalize(), theta).toMatrix();
	      points = function () {
	        results = [];
	        for (var o = 0; 0 <= segments ? o < segments : o > segments; 0 <= segments ? o++ : o--) {
	          results.push(o);
	        }
	        return results;
	      }.apply(this).map(function (i) {
	        var p;
	        p = point1.copy().add(perp);
	        perp.transform(quat);
	        return p;
	      });
	      return seen.Shapes.extrude(points, axis);
	    },
	    patch: function (nx, ny) {
	      var aa, ab, ac, column, len1, len2, len3, o, p, pts, pts0, pts1, ref3, ref4, ref5, ref6, surfaces, u, x, y;
	      if (nx == null) {
	        nx = 20;
	      }
	      if (ny == null) {
	        ny = 20;
	      }
	      nx = Math.round(nx);
	      ny = Math.round(ny);
	      surfaces = [];
	      for (x = o = 0, ref3 = nx; 0 <= ref3 ? o < ref3 : o > ref3; x = 0 <= ref3 ? ++o : --o) {
	        column = [];
	        for (y = u = 0, ref4 = ny; 0 <= ref4 ? u < ref4 : u > ref4; y = 0 <= ref4 ? ++u : --u) {
	          pts0 = [seen.P(x, y), seen.P(x + 1, y - 0.5), seen.P(x + 1, y + 0.5)];
	          pts1 = [seen.P(x, y), seen.P(x + 1, y + 0.5), seen.P(x, y + 1)];
	          ref5 = [pts0, pts1];
	          for (aa = 0, len1 = ref5.length; aa < len1; aa++) {
	            pts = ref5[aa];
	            for (ab = 0, len2 = pts.length; ab < len2; ab++) {
	              p = pts[ab];
	              p.x *= EQUILATERAL_TRIANGLE_ALTITUDE;
	              p.y += x % 2 === 0 ? 0.5 : 0;
	            }
	            column.push(pts);
	          }
	        }
	        if (x % 2 !== 0) {
	          ref6 = column[0];
	          for (ac = 0, len3 = ref6.length; ac < len3; ac++) {
	            p = ref6[ac];
	            p.y += ny;
	          }
	          column.push(column.shift());
	        }
	        surfaces = surfaces.concat(column);
	      }
	      return new seen.Shape('patch', surfaces.map(function (s) {
	        return new seen.Surface(s);
	      }));
	    },
	    text: function (text, surfaceOptions) {
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
	    extrude: function (points, offset) {
	      var back, front, i, len, o, p, ref3, surfaces;
	      surfaces = [];
	      front = new seen.Surface(function () {
	        var len1, o, results;
	        results = [];
	        for (o = 0, len1 = points.length; o < len1; o++) {
	          p = points[o];
	          results.push(p.copy());
	        }
	        return results;
	      }());
	      back = new seen.Surface(function () {
	        var len1, o, results;
	        results = [];
	        for (o = 0, len1 = points.length; o < len1; o++) {
	          p = points[o];
	          results.push(p.add(offset));
	        }
	        return results;
	      }());
	      for (i = o = 1, ref3 = points.length; 1 <= ref3 ? o < ref3 : o > ref3; i = 1 <= ref3 ? ++o : --o) {
	        surfaces.push(new seen.Surface([front.points[i - 1].copy(), back.points[i - 1].copy(), back.points[i].copy(), front.points[i].copy()]));
	      }
	      len = points.length;
	      surfaces.push(new seen.Surface([front.points[len - 1].copy(), back.points[len - 1].copy(), back.points[0].copy(), front.points[0].copy()]));
	      back.points.reverse();
	      surfaces.push(front);
	      surfaces.push(back);
	      return new seen.Shape('extrusion', surfaces);
	    },
	    arrow: function (thickness, tailLength, tailWidth, headLength, headPointiness) {
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
	    path: function (points) {
	      return new seen.Shape('path', [new seen.Surface(points)]);
	    },
	    custom: function (s) {
	      var f, len1, o, p, ref3, surfaces;
	      surfaces = [];
	      ref3 = s.surfaces;
	      for (o = 0, len1 = ref3.length; o < len1; o++) {
	        f = ref3[o];
	        surfaces.push(new seen.Surface(function () {
	          var len2, results, u;
	          results = [];
	          for (u = 0, len2 = f.length; u < len2; u++) {
	            p = f[u];
	            results.push(seen.P.apply(seen, p));
	          }
	          return results;
	        }()));
	      }
	      return new seen.Shape('custom', surfaces);
	    },
	    mapPointsToSurfaces: function (points, coordinateMap) {
	      var c, coords, len1, o, spts, surfaces;
	      surfaces = [];
	      for (o = 0, len1 = coordinateMap.length; o < len1; o++) {
	        coords = coordinateMap[o];
	        spts = function () {
	          var len2, results, u;
	          results = [];
	          for (u = 0, len2 = coords.length; u < len2; u++) {
	            c = coords[u];
	            results.push(points[c].copy());
	          }
	          return results;
	        }();
	        surfaces.push(new seen.Surface(spts));
	      }
	      return surfaces;
	    },
	    _subdivideTriangles: function (triangles) {
	      var len1, newTriangles, o, tri, v01, v12, v20;
	      newTriangles = [];
	      for (o = 0, len1 = triangles.length; o < len1; o++) {
	        tri = triangles[o];
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
	
	  seen.MocapModel = function () {
	    function MocapModel(model1, frames1, frameDelay1) {
	      this.model = model1;
	      this.frames = frames1;
	      this.frameDelay = frameDelay1;
	    }
	
	    MocapModel.prototype.applyFrameTransforms = function (frameIndex) {
	      var frame, len1, o, transform;
	      frame = this.frames[frameIndex];
	      for (o = 0, len1 = frame.length; o < len1; o++) {
	        transform = frame[o];
	        transform.shape.reset().transform(transform.transform);
	      }
	      return (frameIndex + 1) % this.frames.length;
	    };
	
	    return MocapModel;
	  }();
	
	  seen.MocapAnimator = function (superClass) {
	    extend(MocapAnimator, superClass);
	
	    function MocapAnimator(mocap) {
	      this.mocap = mocap;
	      this.renderFrame = bind(this.renderFrame, this);
	      MocapAnimator.__super__.constructor.apply(this, arguments);
	      this.frameIndex = 0;
	      this.frameDelay = this.mocap.frameDelay;
	      this.onFrame(this.renderFrame);
	    }
	
	    MocapAnimator.prototype.renderFrame = function () {
	      return this.frameIndex = this.mocap.applyFrameTransforms(this.frameIndex);
	    };
	
	    return MocapAnimator;
	  }(seen.Animator);
	
	  seen.Mocap = function () {
	    Mocap.DEFAULT_SHAPE_FACTORY = function (joint, endpoint) {
	      return seen.Shapes.pipe(seen.P(), endpoint);
	    };
	
	    Mocap.parse = function (source) {
	      return new seen.Mocap(seen.BvhParser.parse(source));
	    };
	
	    function Mocap(bvh) {
	      this.bvh = bvh;
	    }
	
	    Mocap.prototype.createMocapModel = function (shapeFactory) {
	      var frames, joints, model;
	      if (shapeFactory == null) {
	        shapeFactory = seen.Mocap.DEFAULT_SHAPE_FACTORY;
	      }
	      model = new seen.Model();
	      joints = [];
	      this._attachJoint(model, this.bvh.root, joints, shapeFactory);
	      frames = this.bvh.motion.frames.map(function (_this) {
	        return function (frame) {
	          return _this._generateFrameTransforms(frame, joints);
	        };
	      }(this));
	      return new seen.MocapModel(model, frames, this.bvh.motion.frameTime * 1000);
	    };
	
	    Mocap.prototype._generateFrameTransforms = function (frame, joints) {
	      var fi, transforms;
	      fi = 0;
	      transforms = joints.map(function (_this) {
	        return function (joint) {
	          var ai, m;
	          m = seen.M();
	          ai = joint.channels.length;
	          while (ai > 0) {
	            ai -= 1;
	            _this._applyChannelTransform(joint.channels[ai], m, frame[fi + ai]);
	          }
	          fi += joint.channels.length;
	          m.multiply(joint.offset);
	          return {
	            shape: joint.shape,
	            transform: m
	          };
	        };
	      }(this));
	      return transforms;
	    };
	
	    Mocap.prototype._applyChannelTransform = function (channel, m, v) {
	      switch (channel) {
	        case 'Xposition':
	          m.translate(v, 0, 0);
	          break;
	        case 'Yposition':
	          m.translate(0, v, 0);
	          break;
	        case 'Zposition':
	          m.translate(0, 0, v);
	          break;
	        case 'Xrotation':
	          m.rotx(v * Math.PI / 180.0);
	          break;
	        case 'Yrotation':
	          m.roty(v * Math.PI / 180.0);
	          break;
	        case 'Zrotation':
	          m.rotz(v * Math.PI / 180.0);
	      }
	      return m;
	    };
	
	    Mocap.prototype._attachJoint = function (model, joint, joints, shapeFactory) {
	      var child, childShapes, len1, o, offset, p, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
	      offset = seen.M().translate((ref3 = joint.offset) != null ? ref3.x : void 0, (ref4 = joint.offset) != null ? ref4.y : void 0, (ref5 = joint.offset) != null ? ref5.z : void 0);
	      model.transform(offset);
	      if (joint.channels != null) {
	        joints.push({
	          shape: model,
	          offset: offset,
	          channels: joint.channels
	        });
	      }
	      if (joint.joints != null) {
	        childShapes = model.append();
	        ref6 = joint.joints;
	        for (o = 0, len1 = ref6.length; o < len1; o++) {
	          child = ref6[o];
	          p = seen.P((ref7 = child.offset) != null ? ref7.x : void 0, (ref8 = child.offset) != null ? ref8.y : void 0, (ref9 = child.offset) != null ? ref9.z : void 0);
	          childShapes.add(shapeFactory(joint, p));
	          if (child.type === 'JOINT') {
	            this._attachJoint(childShapes.append(), child, joints, shapeFactory);
	          }
	        }
	      }
	    };
	
	    return Mocap;
	  }();
	
	  seen.ObjParser = function () {
	    function ObjParser() {
	      this.vertices = [];
	      this.faces = [];
	      this.commands = {
	        v: function (_this) {
	          return function (data) {
	            return _this.vertices.push(data.map(function (d) {
	              return parseFloat(d);
	            }));
	          };
	        }(this),
	        f: function (_this) {
	          return function (data) {
	            return _this.faces.push(data.map(function (d) {
	              return parseInt(d);
	            }));
	          };
	        }(this)
	      };
	    }
	
	    ObjParser.prototype.parse = function (contents) {
	      var command, data, len1, line, o, ref3, results;
	      ref3 = contents.split(/[\r\n]+/);
	      results = [];
	      for (o = 0, len1 = ref3.length; o < len1; o++) {
	        line = ref3[o];
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
	        results.push(this.commands[command](data));
	      }
	      return results;
	    };
	
	    ObjParser.prototype.mapFacePoints = function (faceMap) {
	      return this.faces.map(function (_this) {
	        return function (face) {
	          var points;
	          points = face.map(function (v) {
	            return seen.P.apply(seen, _this.vertices[v - 1]);
	          });
	          return faceMap.call(_this, points);
	        };
	      }(this));
	    };
	
	    return ObjParser;
	  }();
	
	  seen.Shapes.obj = function (objContents, cullBackfaces) {
	    var parser;
	    if (cullBackfaces == null) {
	      cullBackfaces = true;
	    }
	    parser = new seen.ObjParser();
	    parser.parse(objContents);
	    return new seen.Shape('obj', parser.mapFacePoints(function (points) {
	      var surface;
	      surface = new seen.Surface(points);
	      surface.cullBackfaces = cullBackfaces;
	      return surface;
	    }));
	  };
	
	  seen.Projections = {
	    perspectiveFov: function (fovyInDegrees, front) {
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
	    perspective: function (left, right, bottom, top, near, far) {
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
	    ortho: function (left, right, bottom, top, near, far) {
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
	    center: function (width, height, x, y) {
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
	    origin: function (width, height, x, y) {
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
	
	  seen.Camera = function (superClass) {
	    extend(Camera, superClass);
	
	    Camera.prototype.defaults = {
	      projection: seen.Projections.perspective()
	    };
	
	    function Camera(options) {
	      seen.Util.defaults(this, options, this.defaults);
	      Camera.__super__.constructor.apply(this, arguments);
	    }
	
	    return Camera;
	  }(seen.Transformable);
	
	  seen.Scene = function () {
	    Scene.prototype.defaults = function () {
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
	      this.flushCache = bind(this.flushCache, this);
	      this.render = bind(this.render, this);
	      seen.Util.defaults(this, options, this.defaults());
	      this._renderModelCache = {};
	    }
	
	    Scene.prototype.render = function () {
	      var projection, renderModels, viewport;
	      projection = this.camera.m.copy().multiply(this.viewport.prescale).multiply(this.camera.projection);
	      viewport = this.viewport.postscale;
	      renderModels = [];
	      this.model.eachRenderable(function (light, transform) {
	        return new seen.LightRenderModel(light, transform);
	      }, function (_this) {
	        return function (shape, lights, transform) {
	          var len1, len2, o, p, ref3, ref4, ref5, ref6, renderModel, results, surface, u;
	          ref3 = shape.surfaces;
	          results = [];
	          for (o = 0, len1 = ref3.length; o < len1; o++) {
	            surface = ref3[o];
	            renderModel = _this._renderSurface(surface, transform, projection, viewport);
	            if ((!_this.cullBackfaces || !surface.cullBackfaces || renderModel.projected.normal.z < 0) && renderModel.inFrustrum) {
	              renderModel.fill = (ref4 = surface.fillMaterial) != null ? ref4.render(lights, _this.shader, renderModel.transformed) : void 0;
	              renderModel.stroke = (ref5 = surface.strokeMaterial) != null ? ref5.render(lights, _this.shader, renderModel.transformed) : void 0;
	              if (_this.fractionalPoints !== true) {
	                ref6 = renderModel.projected.points;
	                for (u = 0, len2 = ref6.length; u < len2; u++) {
	                  p = ref6[u];
	                  p.round();
	                }
	              }
	              results.push(renderModels.push(renderModel));
	            } else {
	              results.push(void 0);
	            }
	          }
	          return results;
	        };
	      }(this));
	      renderModels.sort(function (a, b) {
	        return b.projected.barycenter.z - a.projected.barycenter.z;
	      });
	      return renderModels;
	    };
	
	    Scene.prototype._renderSurface = function (surface, transform, projection, viewport) {
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
	
	    Scene.prototype.flushCache = function () {
	      return this._renderModelCache = {};
	    };
	
	    return Scene;
	  }();
	
	  seen.Grad = function () {
	    function Grad(x4, y4, z4) {
	      this.x = x4;
	      this.y = y4;
	      this.z = z4;
	    }
	
	    Grad.prototype.dot = function (x, y, z) {
	      return this.x * x + this.y * y + this.z * z;
	    };
	
	    return Grad;
	  }();
	
	  grad3 = [new seen.Grad(1, 1, 0), new seen.Grad(-1, 1, 0), new seen.Grad(1, -1, 0), new seen.Grad(-1, -1, 0), new seen.Grad(1, 0, 1), new seen.Grad(-1, 0, 1), new seen.Grad(1, 0, -1), new seen.Grad(-1, 0, -1), new seen.Grad(0, 1, 1), new seen.Grad(0, -1, 1), new seen.Grad(0, 1, -1), new seen.Grad(0, -1, -1)];
	
	  SIMPLEX_PERMUTATIONS_TABLE = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
	
	  F3 = 1 / 3;
	
	  G3 = 1 / 6;
	
	  seen.Simplex3D = function () {
	    function Simplex3D(seed) {
	      if (seed == null) {
	        seed = 0;
	      }
	      this.perm = new Array(512);
	      this.gradP = new Array(512);
	      this.seed(seed);
	    }
	
	    Simplex3D.prototype.seed = function (seed) {
	      var i, o, results, v;
	      if (seed > 0 && seed < 1) {
	        seed *= 65536;
	      }
	      seed = Math.floor(seed);
	      if (seed < 256) {
	        seed |= seed << 8;
	      }
	      results = [];
	      for (i = o = 0; o < 256; i = ++o) {
	        v = 0;
	        if (i & 1) {
	          v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ seed & 255;
	        } else {
	          v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ seed >> 8 & 255;
	        }
	        this.perm[i] = this.perm[i + 256] = v;
	        results.push(this.gradP[i] = this.gradP[i + 256] = grad3[v % 12]);
	      }
	      return results;
	    };
	
	    Simplex3D.prototype.noise = function (x, y, z) {
	      var gi0, gi1, gi2, gi3, i, i1, i2, j, j1, j2, k, k1, k2, n0, n1, n2, n3, s, t, t0, t1, t2, t3, x0, x1, x2, x3, y0, y1, y2, y3, z0, z1, z2, z3;
	      s = (x + y + z) * F3;
	      i = Math.floor(x + s);
	      j = Math.floor(y + s);
	      k = Math.floor(z + s);
	      t = (i + j + k) * G3;
	      x0 = x - i + t;
	      y0 = y - j + t;
	      z0 = z - k + t;
	      if (x0 >= y0) {
	        if (y0 >= z0) {
	          i1 = 1;
	          j1 = 0;
	          k1 = 0;
	          i2 = 1;
	          j2 = 1;
	          k2 = 0;
	        } else if (x0 >= z0) {
	          i1 = 1;
	          j1 = 0;
	          k1 = 0;
	          i2 = 1;
	          j2 = 0;
	          k2 = 1;
	        } else {
	          i1 = 0;
	          j1 = 0;
	          k1 = 1;
	          i2 = 1;
	          j2 = 0;
	          k2 = 1;
	        }
	      } else {
	        if (y0 < z0) {
	          i1 = 0;
	          j1 = 0;
	          k1 = 1;
	          i2 = 0;
	          j2 = 1;
	          k2 = 1;
	        } else if (x0 < z0) {
	          i1 = 0;
	          j1 = 1;
	          k1 = 0;
	          i2 = 0;
	          j2 = 1;
	          k2 = 1;
	        } else {
	          i1 = 0;
	          j1 = 1;
	          k1 = 0;
	          i2 = 1;
	          j2 = 1;
	          k2 = 0;
	        }
	      }
	      x1 = x0 - i1 + G3;
	      y1 = y0 - j1 + G3;
	      z1 = z0 - k1 + G3;
	      x2 = x0 - i2 + 2 * G3;
	      y2 = y0 - j2 + 2 * G3;
	      z2 = z0 - k2 + 2 * G3;
	      x3 = x0 - 1 + 3 * G3;
	      y3 = y0 - 1 + 3 * G3;
	      z3 = z0 - 1 + 3 * G3;
	      i &= 0xFF;
	      j &= 0xFF;
	      k &= 0xFF;
	      gi0 = this.gradP[i + this.perm[j + this.perm[k]]];
	      gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
	      gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
	      gi3 = this.gradP[i + 1 + this.perm[j + 1 + this.perm[k + 1]]];
	      t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
	      if (t0 < 0) {
	        n0 = 0;
	      } else {
	        t0 *= t0;
	        n0 = t0 * t0 * gi0.dot(x0, y0, z0);
	      }
	      t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
	      if (t1 < 0) {
	        n1 = 0;
	      } else {
	        t1 *= t1;
	        n1 = t1 * t1 * gi1.dot(x1, y1, z1);
	      }
	      t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
	      if (t2 < 0) {
	        n2 = 0;
	      } else {
	        t2 *= t2;
	        n2 = t2 * t2 * gi2.dot(x2, y2, z2);
	      }
	      t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
	      if (t3 < 0) {
	        n3 = 0;
	      } else {
	        t3 *= t3;
	        n3 = t3 * t3 * gi3.dot(x3, y3, z3);
	      }
	      return 32 * (n0 + n1 + n2 + n3);
	    };
	
	    return Simplex3D;
	  }();
	
	  seen.BvhParser = function () {
	    "use strict";
	
	    function peg$subclass(child, parent) {
	      function ctor() {
	        this.constructor = child;
	      }
	      ctor.prototype = parent.prototype;
	      child.prototype = new ctor();
	    }
	
	    function peg$SyntaxError(message, expected, found, location) {
	      this.message = message;
	      this.expected = expected;
	      this.found = found;
	      this.location = location;
	      this.name = "SyntaxError";
	
	      if (typeof Error.captureStackTrace === "function") {
	        Error.captureStackTrace(this, peg$SyntaxError);
	      }
	    }
	
	    peg$subclass(peg$SyntaxError, Error);
	
	    function peg$parse(input) {
	      var options = arguments.length > 1 ? arguments[1] : {},
	          parser = this,
	          peg$FAILED = {},
	          peg$startRuleFunctions = { program: peg$parseprogram },
	          peg$startRuleFunction = peg$parseprogram,
	          peg$c0 = "hierarchy",
	          peg$c1 = { type: "literal", value: "HIERARCHY", description: "\"HIERARCHY\"" },
	          peg$c2 = function (root, motion) {
	        return { root: root, motion: motion };
	      },
	          peg$c3 = "root",
	          peg$c4 = { type: "literal", value: "ROOT", description: "\"ROOT\"" },
	          peg$c5 = "{",
	          peg$c6 = { type: "literal", value: "{", description: "\"{\"" },
	          peg$c7 = "}",
	          peg$c8 = { type: "literal", value: "}", description: "\"}\"" },
	          peg$c9 = function (id, offset, channels, joints) {
	        return { id: id, offset: offset, channels: channels, joints: joints };
	      },
	          peg$c10 = "joint",
	          peg$c11 = { type: "literal", value: "JOINT", description: "\"JOINT\"" },
	          peg$c12 = function (id, offset, channels, joints) {
	        return { type: 'JOINT', id: id, offset: offset, channels: channels, joints: joints };
	      },
	          peg$c13 = "end site",
	          peg$c14 = { type: "literal", value: "END SITE", description: "\"END SITE\"" },
	          peg$c15 = function (offset) {
	        return { type: 'END SITE', offset: offset };
	      },
	          peg$c16 = "offset",
	          peg$c17 = { type: "literal", value: "OFFSET", description: "\"OFFSET\"" },
	          peg$c18 = function (x, y, z) {
	        return { x: x, y: y, z: z };
	      },
	          peg$c19 = "channels",
	          peg$c20 = { type: "literal", value: "CHANNELS", description: "\"CHANNELS\"" },
	          peg$c21 = /^[0-9]/,
	          peg$c22 = { type: "class", value: "[0-9]", description: "[0-9]" },
	          peg$c23 = function (count, channels) {
	        return channels;
	      },
	          peg$c24 = "xposition",
	          peg$c25 = { type: "literal", value: "Xposition", description: "\"Xposition\"" },
	          peg$c26 = "yposition",
	          peg$c27 = { type: "literal", value: "Yposition", description: "\"Yposition\"" },
	          peg$c28 = "zposition",
	          peg$c29 = { type: "literal", value: "Zposition", description: "\"Zposition\"" },
	          peg$c30 = "xrotation",
	          peg$c31 = { type: "literal", value: "Xrotation", description: "\"Xrotation\"" },
	          peg$c32 = "yrotation",
	          peg$c33 = { type: "literal", value: "Yrotation", description: "\"Yrotation\"" },
	          peg$c34 = "zrotation",
	          peg$c35 = { type: "literal", value: "Zrotation", description: "\"Zrotation\"" },
	          peg$c36 = function (channel_type) {
	        return channel_type;
	      },
	          peg$c37 = "motion",
	          peg$c38 = { type: "literal", value: "MOTION", description: "\"MOTION\"" },
	          peg$c39 = "frames:",
	          peg$c40 = { type: "literal", value: "Frames:", description: "\"Frames:\"" },
	          peg$c41 = "frame time:",
	          peg$c42 = { type: "literal", value: "Frame Time:", description: "\"Frame Time:\"" },
	          peg$c43 = function (frameCount, frameTime, frames) {
	        return { frameCount: frameCount, frameTime: frameTime, frames: frames };
	      },
	          peg$c44 = /^[\n\r]/,
	          peg$c45 = { type: "class", value: "[\\n\\r]", description: "[\\n\\r]" },
	          peg$c46 = function (frameValues) {
	        return frameValues;
	      },
	          peg$c47 = /^[ ]/,
	          peg$c48 = { type: "class", value: "[ ]", description: "[ ]" },
	          peg$c49 = function (value) {
	        return value;
	      },
	          peg$c50 = /^[a-zA-Z0-9\-_]/,
	          peg$c51 = { type: "class", value: "[a-zA-Z0-9-_]", description: "[a-zA-Z0-9-_]" },
	          peg$c52 = /^[\-0-9.e]/,
	          peg$c53 = { type: "class", value: "[-0-9.e]", description: "[-0-9.e]" },
	          peg$c54 = function (value) {
	        return parseFloat(value.join(''));
	      },
	          peg$c55 = /^[\-0-9e]/,
	          peg$c56 = { type: "class", value: "[-0-9e]", description: "[-0-9e]" },
	          peg$c57 = function (value) {
	        return parseInt(value.join(''));
	      },
	          peg$c58 = /^[ \t\n\r]/,
	          peg$c59 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
	          peg$c60 = function () {
	        return undefined;
	      },
	          peg$currPos = 0,
	          peg$savedPos = 0,
	          peg$posDetailsCache = [{ line: 1, column: 1, seenCR: false }],
	          peg$maxFailPos = 0,
	          peg$maxFailExpected = [],
	          peg$silentFails = 0,
	          peg$result;
	
	      if ("startRule" in options) {
	        if (!(options.startRule in peg$startRuleFunctions)) {
	          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	        }
	
	        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	      }
	
	      function text() {
	        return input.substring(peg$savedPos, peg$currPos);
	      }
	
	      function location() {
	        return peg$computeLocation(peg$savedPos, peg$currPos);
	      }
	
	      function expected(description) {
	        throw peg$buildException(null, [{ type: "other", description: description }], input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
	      }
	
	      function error(message) {
	        throw peg$buildException(message, null, input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
	      }
	
	      function peg$computePosDetails(pos) {
	        var details = peg$posDetailsCache[pos],
	            p,
	            ch;
	
	        if (details) {
	          return details;
	        } else {
	          p = pos - 1;
	          while (!peg$posDetailsCache[p]) {
	            p--;
	          }
	
	          details = peg$posDetailsCache[p];
	          details = {
	            line: details.line,
	            column: details.column,
	            seenCR: details.seenCR
	          };
	
	          while (p < pos) {
	            ch = input.charAt(p);
	            if (ch === "\n") {
	              if (!details.seenCR) {
	                details.line++;
	              }
	              details.column = 1;
	              details.seenCR = false;
	            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	              details.line++;
	              details.column = 1;
	              details.seenCR = true;
	            } else {
	              details.column++;
	              details.seenCR = false;
	            }
	
	            p++;
	          }
	
	          peg$posDetailsCache[pos] = details;
	          return details;
	        }
	      }
	
	      function peg$computeLocation(startPos, endPos) {
	        var startPosDetails = peg$computePosDetails(startPos),
	            endPosDetails = peg$computePosDetails(endPos);
	
	        return {
	          start: {
	            offset: startPos,
	            line: startPosDetails.line,
	            column: startPosDetails.column
	          },
	          end: {
	            offset: endPos,
	            line: endPosDetails.line,
	            column: endPosDetails.column
	          }
	        };
	      }
	
	      function peg$fail(expected) {
	        if (peg$currPos < peg$maxFailPos) {
	          return;
	        }
	
	        if (peg$currPos > peg$maxFailPos) {
	          peg$maxFailPos = peg$currPos;
	          peg$maxFailExpected = [];
	        }
	
	        peg$maxFailExpected.push(expected);
	      }
	
	      function peg$buildException(message, expected, found, location) {
	        function cleanupExpected(expected) {
	          var i = 1;
	
	          expected.sort(function (a, b) {
	            if (a.description < b.description) {
	              return -1;
	            } else if (a.description > b.description) {
	              return 1;
	            } else {
	              return 0;
	            }
	          });
	
	          while (i < expected.length) {
	            if (expected[i - 1] === expected[i]) {
	              expected.splice(i, 1);
	            } else {
	              i++;
	            }
	          }
	        }
	
	        function buildMessage(expected, found) {
	          function stringEscape(s) {
	            function hex(ch) {
	              return ch.charCodeAt(0).toString(16).toUpperCase();
	            }
	
	            return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
	              return '\\x0' + hex(ch);
	            }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
	              return '\\x' + hex(ch);
	            }).replace(/[\u0100-\u0FFF]/g, function (ch) {
	              return '\\u0' + hex(ch);
	            }).replace(/[\u1000-\uFFFF]/g, function (ch) {
	              return '\\u' + hex(ch);
	            });
	          }
	
	          var expectedDescs = new Array(expected.length),
	              expectedDesc,
	              foundDesc,
	              i;
	
	          for (i = 0; i < expected.length; i++) {
	            expectedDescs[i] = expected[i].description;
	          }
	
	          expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];
	
	          foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
	
	          return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	        }
	
	        if (expected !== null) {
	          cleanupExpected(expected);
	        }
	
	        return new peg$SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, location);
	      }
	
	      function peg$parseprogram() {
	        var s0, s1, s2, s3, s4, s5;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 9).toLowerCase() === peg$c0) {
	          s1 = input.substr(peg$currPos, 9);
	          peg$currPos += 9;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c1);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parseroot();
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parsemotion();
	                if (s5 !== peg$FAILED) {
	                  peg$savedPos = s0;
	                  s1 = peg$c2(s3, s5);
	                  s0 = s1;
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parseroot() {
	        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c3) {
	          s1 = input.substr(peg$currPos, 4);
	          peg$currPos += 4;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c4);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parseid();
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 123) {
	                  s5 = peg$c5;
	                  peg$currPos++;
	                } else {
	                  s5 = peg$FAILED;
	                  if (peg$silentFails === 0) {
	                    peg$fail(peg$c6);
	                  }
	                }
	                if (s5 !== peg$FAILED) {
	                  s6 = peg$parse_();
	                  if (s6 !== peg$FAILED) {
	                    s7 = peg$parseoffset();
	                    if (s7 !== peg$FAILED) {
	                      s8 = peg$parse_();
	                      if (s8 !== peg$FAILED) {
	                        s9 = peg$parsechannels();
	                        if (s9 !== peg$FAILED) {
	                          s10 = peg$parse_();
	                          if (s10 !== peg$FAILED) {
	                            s11 = [];
	                            s12 = peg$parsejoint();
	                            while (s12 !== peg$FAILED) {
	                              s11.push(s12);
	                              s12 = peg$parsejoint();
	                            }
	                            if (s11 !== peg$FAILED) {
	                              if (input.charCodeAt(peg$currPos) === 125) {
	                                s12 = peg$c7;
	                                peg$currPos++;
	                              } else {
	                                s12 = peg$FAILED;
	                                if (peg$silentFails === 0) {
	                                  peg$fail(peg$c8);
	                                }
	                              }
	                              if (s12 !== peg$FAILED) {
	                                peg$savedPos = s0;
	                                s1 = peg$c9(s3, s7, s9, s11);
	                                s0 = s1;
	                              } else {
	                                peg$currPos = s0;
	                                s0 = peg$FAILED;
	                              }
	                            } else {
	                              peg$currPos = s0;
	                              s0 = peg$FAILED;
	                            }
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parsejoint() {
	        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c10) {
	          s1 = input.substr(peg$currPos, 5);
	          peg$currPos += 5;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c11);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parseid();
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 123) {
	                  s5 = peg$c5;
	                  peg$currPos++;
	                } else {
	                  s5 = peg$FAILED;
	                  if (peg$silentFails === 0) {
	                    peg$fail(peg$c6);
	                  }
	                }
	                if (s5 !== peg$FAILED) {
	                  s6 = peg$parse_();
	                  if (s6 !== peg$FAILED) {
	                    s7 = peg$parseoffset();
	                    if (s7 !== peg$FAILED) {
	                      s8 = peg$parse_();
	                      if (s8 !== peg$FAILED) {
	                        s9 = peg$parsechannels();
	                        if (s9 !== peg$FAILED) {
	                          s10 = peg$parse_();
	                          if (s10 !== peg$FAILED) {
	                            s11 = [];
	                            s12 = peg$parsejoint();
	                            while (s12 !== peg$FAILED) {
	                              s11.push(s12);
	                              s12 = peg$parsejoint();
	                            }
	                            if (s11 !== peg$FAILED) {
	                              if (input.charCodeAt(peg$currPos) === 125) {
	                                s12 = peg$c7;
	                                peg$currPos++;
	                              } else {
	                                s12 = peg$FAILED;
	                                if (peg$silentFails === 0) {
	                                  peg$fail(peg$c8);
	                                }
	                              }
	                              if (s12 !== peg$FAILED) {
	                                s13 = peg$parse_();
	                                if (s13 !== peg$FAILED) {
	                                  peg$savedPos = s0;
	                                  s1 = peg$c12(s3, s7, s9, s11);
	                                  s0 = s1;
	                                } else {
	                                  peg$currPos = s0;
	                                  s0 = peg$FAILED;
	                                }
	                              } else {
	                                peg$currPos = s0;
	                                s0 = peg$FAILED;
	                              }
	                            } else {
	                              peg$currPos = s0;
	                              s0 = peg$FAILED;
	                            }
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          if (input.substr(peg$currPos, 8).toLowerCase() === peg$c13) {
	            s1 = input.substr(peg$currPos, 8);
	            peg$currPos += 8;
	          } else {
	            s1 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c14);
	            }
	          }
	          if (s1 !== peg$FAILED) {
	            s2 = peg$parse_();
	            if (s2 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 123) {
	                s3 = peg$c5;
	                peg$currPos++;
	              } else {
	                s3 = peg$FAILED;
	                if (peg$silentFails === 0) {
	                  peg$fail(peg$c6);
	                }
	              }
	              if (s3 !== peg$FAILED) {
	                s4 = peg$parse_();
	                if (s4 !== peg$FAILED) {
	                  s5 = peg$parseoffset();
	                  if (s5 !== peg$FAILED) {
	                    s6 = peg$parse_();
	                    if (s6 !== peg$FAILED) {
	                      if (input.charCodeAt(peg$currPos) === 125) {
	                        s7 = peg$c7;
	                        peg$currPos++;
	                      } else {
	                        s7 = peg$FAILED;
	                        if (peg$silentFails === 0) {
	                          peg$fail(peg$c8);
	                        }
	                      }
	                      if (s7 !== peg$FAILED) {
	                        s8 = peg$parse_();
	                        if (s8 !== peg$FAILED) {
	                          peg$savedPos = s0;
	                          s1 = peg$c15(s5);
	                          s0 = s1;
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        }
	
	        return s0;
	      }
	
	      function peg$parseoffset() {
	        var s0, s1, s2, s3, s4, s5, s6, s7;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c16) {
	          s1 = input.substr(peg$currPos, 6);
	          peg$currPos += 6;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c17);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parsefloat();
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parsefloat();
	                if (s5 !== peg$FAILED) {
	                  s6 = peg$parse_();
	                  if (s6 !== peg$FAILED) {
	                    s7 = peg$parsefloat();
	                    if (s7 !== peg$FAILED) {
	                      peg$savedPos = s0;
	                      s1 = peg$c18(s3, s5, s7);
	                      s0 = s1;
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parsechannels() {
	        var s0, s1, s2, s3, s4, s5, s6;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 8).toLowerCase() === peg$c19) {
	          s1 = input.substr(peg$currPos, 8);
	          peg$currPos += 8;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c20);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            if (peg$c21.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c22);
	              }
	            }
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                s5 = [];
	                s6 = peg$parsechannel_type();
	                while (s6 !== peg$FAILED) {
	                  s5.push(s6);
	                  s6 = peg$parsechannel_type();
	                }
	                if (s5 !== peg$FAILED) {
	                  peg$savedPos = s0;
	                  s1 = peg$c23(s3, s5);
	                  s0 = s1;
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parsechannel_type() {
	        var s0, s1, s2;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 9).toLowerCase() === peg$c24) {
	          s1 = input.substr(peg$currPos, 9);
	          peg$currPos += 9;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c25);
	          }
	        }
	        if (s1 === peg$FAILED) {
	          if (input.substr(peg$currPos, 9).toLowerCase() === peg$c26) {
	            s1 = input.substr(peg$currPos, 9);
	            peg$currPos += 9;
	          } else {
	            s1 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c27);
	            }
	          }
	          if (s1 === peg$FAILED) {
	            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c28) {
	              s1 = input.substr(peg$currPos, 9);
	              peg$currPos += 9;
	            } else {
	              s1 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c29);
	              }
	            }
	            if (s1 === peg$FAILED) {
	              if (input.substr(peg$currPos, 9).toLowerCase() === peg$c30) {
	                s1 = input.substr(peg$currPos, 9);
	                peg$currPos += 9;
	              } else {
	                s1 = peg$FAILED;
	                if (peg$silentFails === 0) {
	                  peg$fail(peg$c31);
	                }
	              }
	              if (s1 === peg$FAILED) {
	                if (input.substr(peg$currPos, 9).toLowerCase() === peg$c32) {
	                  s1 = input.substr(peg$currPos, 9);
	                  peg$currPos += 9;
	                } else {
	                  s1 = peg$FAILED;
	                  if (peg$silentFails === 0) {
	                    peg$fail(peg$c33);
	                  }
	                }
	                if (s1 === peg$FAILED) {
	                  if (input.substr(peg$currPos, 9).toLowerCase() === peg$c34) {
	                    s1 = input.substr(peg$currPos, 9);
	                    peg$currPos += 9;
	                  } else {
	                    s1 = peg$FAILED;
	                    if (peg$silentFails === 0) {
	                      peg$fail(peg$c35);
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c36(s1);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parsemotion() {
	        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
	
	        s0 = peg$currPos;
	        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c37) {
	          s1 = input.substr(peg$currPos, 6);
	          peg$currPos += 6;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c38);
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parse_();
	          if (s2 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c39) {
	              s3 = input.substr(peg$currPos, 7);
	              peg$currPos += 7;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c40);
	              }
	            }
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parseinteger();
	                if (s5 !== peg$FAILED) {
	                  s6 = peg$parse_();
	                  if (s6 !== peg$FAILED) {
	                    if (input.substr(peg$currPos, 11).toLowerCase() === peg$c41) {
	                      s7 = input.substr(peg$currPos, 11);
	                      peg$currPos += 11;
	                    } else {
	                      s7 = peg$FAILED;
	                      if (peg$silentFails === 0) {
	                        peg$fail(peg$c42);
	                      }
	                    }
	                    if (s7 !== peg$FAILED) {
	                      s8 = peg$parse_();
	                      if (s8 !== peg$FAILED) {
	                        s9 = peg$parsefloat();
	                        if (s9 !== peg$FAILED) {
	                          s10 = peg$parse_();
	                          if (s10 !== peg$FAILED) {
	                            s11 = [];
	                            s12 = peg$parseframe_data();
	                            while (s12 !== peg$FAILED) {
	                              s11.push(s12);
	                              s12 = peg$parseframe_data();
	                            }
	                            if (s11 !== peg$FAILED) {
	                              peg$savedPos = s0;
	                              s1 = peg$c43(s5, s9, s11);
	                              s0 = s1;
	                            } else {
	                              peg$currPos = s0;
	                              s0 = peg$FAILED;
	                            }
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parseframe_data() {
	        var s0, s1, s2, s3;
	
	        s0 = peg$currPos;
	        s1 = [];
	        s2 = peg$parseframe_value();
	        if (s2 !== peg$FAILED) {
	          while (s2 !== peg$FAILED) {
	            s1.push(s2);
	            s2 = peg$parseframe_value();
	          }
	        } else {
	          s1 = peg$FAILED;
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = [];
	          if (peg$c44.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c45);
	            }
	          }
	          if (s3 !== peg$FAILED) {
	            while (s3 !== peg$FAILED) {
	              s2.push(s3);
	              if (peg$c44.test(input.charAt(peg$currPos))) {
	                s3 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s3 = peg$FAILED;
	                if (peg$silentFails === 0) {
	                  peg$fail(peg$c45);
	                }
	              }
	            }
	          } else {
	            s2 = peg$FAILED;
	          }
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c46(s1);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parseframe_value() {
	        var s0, s1, s2, s3;
	
	        s0 = peg$currPos;
	        s1 = peg$parsefloat();
	        if (s1 !== peg$FAILED) {
	          s2 = [];
	          if (peg$c47.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c48);
	            }
	          }
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c47.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c48);
	              }
	            }
	          }
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c49(s1);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	
	        return s0;
	      }
	
	      function peg$parseid() {
	        var s0, s1, s2;
	
	        s0 = peg$currPos;
	        s1 = [];
	        if (peg$c50.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c51);
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          while (s2 !== peg$FAILED) {
	            s1.push(s2);
	            if (peg$c50.test(input.charAt(peg$currPos))) {
	              s2 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c51);
	              }
	            }
	          }
	        } else {
	          s1 = peg$FAILED;
	        }
	        if (s1 !== peg$FAILED) {
	          s0 = input.substring(s0, peg$currPos);
	        } else {
	          s0 = s1;
	        }
	
	        return s0;
	      }
	
	      function peg$parsefloat() {
	        var s0, s1, s2;
	
	        s0 = peg$currPos;
	        s1 = [];
	        if (peg$c52.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c53);
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          while (s2 !== peg$FAILED) {
	            s1.push(s2);
	            if (peg$c52.test(input.charAt(peg$currPos))) {
	              s2 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c53);
	              }
	            }
	          }
	        } else {
	          s1 = peg$FAILED;
	        }
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c54(s1);
	        }
	        s0 = s1;
	
	        return s0;
	      }
	
	      function peg$parseinteger() {
	        var s0, s1, s2;
	
	        s0 = peg$currPos;
	        s1 = [];
	        if (peg$c55.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c56);
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          while (s2 !== peg$FAILED) {
	            s1.push(s2);
	            if (peg$c55.test(input.charAt(peg$currPos))) {
	              s2 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c56);
	              }
	            }
	          }
	        } else {
	          s1 = peg$FAILED;
	        }
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c57(s1);
	        }
	        s0 = s1;
	
	        return s0;
	      }
	
	      function peg$parse_() {
	        var s0, s1, s2;
	
	        s0 = peg$currPos;
	        s1 = [];
	        if (peg$c58.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c59);
	          }
	        }
	        while (s2 !== peg$FAILED) {
	          s1.push(s2);
	          if (peg$c58.test(input.charAt(peg$currPos))) {
	            s2 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c59);
	            }
	          }
	        }
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c60();
	        }
	        s0 = s1;
	
	        return s0;
	      }
	
	      peg$result = peg$startRuleFunction();
	
	      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	        return peg$result;
	      } else {
	        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	          peg$fail({ type: "end", description: "end of input" });
	        }
	
	        throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
	      }
	    }
	
	    return {
	      SyntaxError: peg$SyntaxError,
	      parse: peg$parse
	    };
	  }();
	})(this);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;
//# sourceMappingURL=seen.js.map