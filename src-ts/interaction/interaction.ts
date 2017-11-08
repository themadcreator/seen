/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// ## Interaction
// #### Mouse drag and zoom
// ------------------

// A global window event dispatcher. Attaches listeners only if window is defined.
seen.WindowEvents = (function() {
  const dispatch = seen.Events.dispatch(
    'mouseMove',
    'mouseDown',
    'mouseUp',
    'touchStart',
    'touchMove',
    'touchEnd',
    'touchCancel'
  );

  if (typeof window !== 'undefined' && window !== null) {
    window.addEventListener('mouseup', dispatch.mouseUp, true);
    window.addEventListener('mousedown', dispatch.mouseDown, true);
    window.addEventListener('mousemove', dispatch.mouseMove, true);
    window.addEventListener('touchstart', dispatch.touchStart, true);
    window.addEventListener('touchmove', dispatch.touchMove, true);
    window.addEventListener('touchend', dispatch.touchEnd, true);
    window.addEventListener('touchcancel', dispatch.touchCancel, true);
  }
  return {on : dispatch.on};
})();

// An event dispatcher for mouse and drag events on a single dom element. The
// available events are `'dragStart', 'drag', 'dragEnd', 'mouseMove',
// 'mouseDown', 'mouseUp', 'mouseWheel'`
seen.MouseEvents = class MouseEvents {
  constructor(el, options) {
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);
    this.el = el;
    seen.Util.defaults(this, options, this.defaults);

    this.el = seen.Util.element(this.el);

    this._uid = seen.Util.uniqueId('mouser-');

    this.dispatch = seen.Events.dispatch(
      'dragStart',
      'drag',
      'dragEnd',
      'mouseMove',
      'mouseDown',
      'mouseUp',
      'mouseWheel'
    );
    this.on = this.dispatch.on;

    this._mouseDown = false;
    this.attach();
  }

  // Attaches listeners to the element
  attach() {
    this.el.addEventListener('touchstart', this._onMouseDown);
    this.el.addEventListener('mousedown', this._onMouseDown);
    return this.el.addEventListener('mousewheel', this._onMouseWheel);
  }

  // Dettaches listeners to the element
  detach() {
    this.el.removeEventListener('touchstart', this._onMouseDown);
    this.el.removeEventListener('mousedown', this._onMouseDown);
    return this.el.removeEventListener('mousewheel', this._onMouseWheel);
  }

  _onMouseMove(e) {
    this.dispatch.mouseMove(e);
    e.preventDefault();
    e.stopPropagation();
    if (this._mouseDown) { return this.dispatch.drag(e); }
  }

  _onMouseDown(e) {
    this._mouseDown = true;
    seen.WindowEvents.on(`mouseUp.${this._uid}`, this._onMouseUp);
    seen.WindowEvents.on(`mouseMove.${this._uid}`, this._onMouseMove);
    seen.WindowEvents.on(`touchEnd.${this._uid}`, this._onMouseUp);
    seen.WindowEvents.on(`touchCancel.${this._uid}`, this._onMouseUp);
    seen.WindowEvents.on(`touchMove.${this._uid}`, this._onMouseMove);
    this.dispatch.mouseDown(e);
    return this.dispatch.dragStart(e);
  }

  _onMouseUp(e) {
    this._mouseDown = false;
    seen.WindowEvents.on(`mouseUp.${this._uid}`, null);
    seen.WindowEvents.on(`mouseMove.${this._uid}`, null);
    seen.WindowEvents.on(`touchEnd.${this._uid}`, null);
    seen.WindowEvents.on(`touchCancel.${this._uid}`, null);
    seen.WindowEvents.on(`touchMove.${this._uid}`, null);
    this.dispatch.mouseUp(e);
    return this.dispatch.dragEnd(e);
  }

  _onMouseWheel(e) {
    return this.dispatch.mouseWheel(e);
  }
};

// A class for computing mouse interia for interial scrolling
let Cls = (seen.InertialMouse = class InertialMouse {
  static initClass() {
    this.inertiaExtinction  = 0.1;
    this.smoothingTimeout   = 300;
    this.inertiaMsecDelay   = 30;
  }

  constructor() {
    this.reset();
  }

  get() {
    const scale = 1000 / seen.InertialMouse.inertiaMsecDelay;
    return [this.x * scale, this.y * scale];
  }

  reset() {
    this.xy = [0, 0];
    return this;
  }

  update(xy) {
    if (this.lastUpdate != null) {
      const msec = new Date().getTime() - this.lastUpdate.getTime(); // Time passed
      xy = xy.map(x => x / Math.max(msec, 1)); // Pixels per milliseconds
      const t = Math.min(1, msec / seen.InertialMouse.smoothingTimeout); // Interpolation based on time between measurements
      this.x = (t * xy[0]) + ((1.0 - t) * this.x);
      this.y = (t * xy[1]) + ((1.0 - t) * this.y);
    } else {
     [this.x, this.y] = Array.from(xy);
   }

    this.lastUpdate = new Date();
    return this;
  }

  // Apply damping to slow the motion once the user has stopped dragging.
  damp() {
    this.x *= (1.0 - seen.InertialMouse.inertiaExtinction);
    this.y *= (1.0 - seen.InertialMouse.inertiaExtinction);
    return this;
  }
});
Cls.initClass();

// Adds simple mouse drag eventing to a DOM element. A 'drag' event is emitted
// as the user is dragging their mouse. This is the easiest way to add mouse-
// look or mouse-rotate to a scene.
Cls = (seen.Drag = class Drag {
  static initClass() {
    this.prototype.defaults =
      {inertia : false};
  }

  constructor(el, options) {
    this._getPageCoords = this._getPageCoords.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onInertia = this._onInertia.bind(this);
    this._startInertia = this._startInertia.bind(this);
    this._stopInertia = this._stopInertia.bind(this);
    this.el = el;
    seen.Util.defaults(this, options, this.defaults);
    this.el = seen.Util.element(this.el);
    this._uid = seen.Util.uniqueId('dragger-');

    this._inertiaRunning = false;
    this._dragState = {
      dragging : false,
      origin   : null,
      last     : null,
      inertia  : new seen.InertialMouse()
    };

    this.dispatch = seen.Events.dispatch('drag', 'dragStart', 'dragEnd', 'dragEndInertia');
    this.on       = this.dispatch.on;

    const mouser = new seen.MouseEvents(this.el);
    mouser.on(`dragStart.${this._uid}`, this._onDragStart);
    mouser.on(`dragEnd.${this._uid}`, this._onDragEnd);
    mouser.on(`drag.${this._uid}`, this._onDrag);
  }

  _getPageCoords(e) {
    if ((e.touches != null ? e.touches.length : undefined) > 0) {
      return [e.touches[0].pageX, e.touches[0].pageY];
    } else if ((e.changedTouches != null ? e.changedTouches.length : undefined) > 0) {
      return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    } else {
      return [e.pageX, e.pageY];
    }
  }

  _onDragStart(e) {
    this._stopInertia();
    this._dragState.dragging = true;
    this._dragState.origin   = this._getPageCoords(e);
    this._dragState.last     = this._getPageCoords(e);
    return this.dispatch.dragStart(e);
  }

  _onDragEnd(e) {
    this._dragState.dragging = false;

    if (this.inertia) {
      const page = this._getPageCoords(e);
      const dragEvent = {
        offset         : [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
        offsetRelative : [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]]
      };

      this._dragState.inertia.update(dragEvent.offsetRelative);
      this._startInertia();
    }

    return this.dispatch.dragEnd(e);
  }

  _onDrag(e) {
    const page = this._getPageCoords(e);

    const dragEvent = {
      offset         : [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
      offsetRelative : [page[0] - this._dragState.last[0], page[1]- this._dragState.last[1]]
    };

    this.dispatch.drag(dragEvent);

    if (this.inertia) {
      this._dragState.inertia.update(dragEvent.offsetRelative);
    }

    return this._dragState.last = page;
  }

  _onInertia() {
    if (!this._inertiaRunning) { return; }

    // Apply damping and get x,y intertia values
    const intertia = this._dragState.inertia.damp().get();

    if ((Math.abs(intertia[0]) < 1) && (Math.abs(intertia[1]) < 1)) {
      this._stopInertia();
      this.dispatch.dragEndInertia();
      return;
    }

    this.dispatch.drag({
      offset         : [this._dragState.last[0] - this._dragState.origin[0], this._dragState.last[0] - this._dragState.origin[1]],
      offsetRelative : intertia
    });
    this._dragState.last = [this._dragState.last[0] + intertia[0], this._dragState.last[1] + intertia[1]];

    return this._startInertia();
  }

  _startInertia() {
    this._inertiaRunning = true;
    return setTimeout(this._onInertia, seen.InertialMouse.inertiaMsecDelay);
  }

  _stopInertia() {
    this._dragState.inertia.reset();
    return this._inertiaRunning = false;
  }
});
Cls.initClass();

// Adds simple mouse wheel eventing to a DOM element. A 'zoom' event is emitted
// as the user is scrolls their mouse wheel.
Cls = (seen.Zoom = class Zoom {
  static initClass() {
    this.prototype.defaults  =
      {speed : 0.25};
  }

  constructor(el,  options) {
    this._onMouseWheel = this._onMouseWheel.bind(this);
    this.el = el;
    seen.Util.defaults(this, options, this.defaults);
    this.el       = seen.Util.element(this.el);
    this._uid     = seen.Util.uniqueId('zoomer-');
    this.dispatch = seen.Events.dispatch('zoom');
    this.on       = this.dispatch.on;

    const mouser    = new seen.MouseEvents(this.el);
    mouser.on(`mouseWheel.${this._uid}`, this._onMouseWheel);
  }

  _onMouseWheel(e) {
    // This prevents the page from scrolling when we mousewheel the element
    e.preventDefault();

    const sign       = e.wheelDelta / Math.abs(e.wheelDelta);
    const zoomFactor = (Math.abs(e.wheelDelta) / 120) * this.speed;
    const zoom       = Math.pow(2, sign*zoomFactor);

    return this.dispatch.zoom({zoom});
  }
});
Cls.initClass();
