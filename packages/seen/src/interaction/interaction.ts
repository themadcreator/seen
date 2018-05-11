import { Events, EventRegistrar } from "../events";
import { Util } from "../util";

// ## Interaction
// #### Mouse drag and zoom
// ------------------

export interface IWindowEvents {
  mouseMove: (e: MouseEvent) => void;
  mouseDown: (e: MouseEvent) => void;
  mouseUp: (e: MouseEvent) => void;
  touchStart: (e: TouchEvent) => void;
  touchMove: (e: TouchEvent) => void;
  touchEnd: (e: TouchEvent) => void;
  touchCancel: (e: TouchEvent) => void;
}

// A global window event dispatcher. Attaches listeners only if window is defined.
export const WindowEvents = (() => {
  const events = new Events<IWindowEvents>();

  if (typeof window !== 'undefined' && window !== null) {
    window.addEventListener('mouseup', events.emitter("mouseUp"), true);
    window.addEventListener('mousedown', events.emitter("mouseDown"), true);
    window.addEventListener('mousemove', events.emitter("mouseMove"), true);
    window.addEventListener('touchstart', events.emitter("touchStart"), true);
    window.addEventListener('touchmove', events.emitter("touchMove"), true);
    window.addEventListener('touchend', events.emitter("touchEnd"), true);
    window.addEventListener('touchcancel', events.emitter("touchCancel"), true);
  }

  return events;
})();

export interface IMouseEvents {
  dragStart: (e: MouseEvent | TouchEvent) => void;
  drag: (e: MouseEvent | TouchEvent) => void;
  dragEnd: (e: MouseEvent | TouchEvent) => void;
  mouseMove: (e: MouseEvent | TouchEvent) => void;
  mouseDown: (e: MouseEvent | TouchEvent) => void;
  mouseUp: (e: MouseEvent | TouchEvent) => void;
  mouseWheel: (e: MouseWheelEvent) => void;
}

// An event dispatcher for mouse and drag events on a single dom element. The
// available events are `'dragStart', 'drag', 'dragEnd', 'mouseMove',
// 'mouseDown', 'mouseUp', 'mouseWheel'`
export class MouseEvents implements EventRegistrar<IMouseEvents> {
  private el: HTMLElement;
  private isMouseDown = false;
  private events = new Events<IMouseEvents>();
  public on = this.events.on;
  public off = this.events.off;

  constructor(el: HTMLElement) {
    this.el = Util.element(el);
    this.attach();
  }

  // Attaches listeners to the element
  public attach() {
    this.el.addEventListener('touchstart', this._onMouseDown);
    this.el.addEventListener('mousedown', this._onMouseDown);
    return this.el.addEventListener('mousewheel', this._onMouseWheel);
  }

  // Dettaches listeners to the element
  public detach() {
    this.el.removeEventListener('touchstart', this._onMouseDown);
    this.el.removeEventListener('mousedown', this._onMouseDown);
    return this.el.removeEventListener('mousewheel', this._onMouseWheel);
  }

  private _onMouseMove = (e: MouseEvent | TouchEvent) => {
    this.events.emitter("mouseMove")(e);
    e.preventDefault();
    e.stopPropagation();
    if (this.isMouseDown) { return this.events.emitter("drag")(e); }
  }

  private _onMouseDown = (e: MouseEvent | TouchEvent) => {
    this.isMouseDown = true;
    WindowEvents.on("mouseUp", this._onMouseUp);
    WindowEvents.on("mouseMove", this._onMouseMove);
    WindowEvents.on("touchEnd", this._onMouseUp);
    WindowEvents.on("touchCancel", this._onMouseUp);
    WindowEvents.on("touchMove", this._onMouseMove);
    this.events.emitter("mouseDown")(e);
    return this.events.emitter("dragStart")(e);
  }

  private _onMouseUp =  (e: MouseEvent | TouchEvent) => {
    this.isMouseDown = false;
    WindowEvents.off("mouseUp", this._onMouseUp);
    WindowEvents.off("mouseMove", this._onMouseMove);
    WindowEvents.off("touchEnd", this._onMouseUp);
    WindowEvents.off("touchCancel", this._onMouseUp);
    WindowEvents.off("touchMove", this._onMouseMove);
    this.events.emitter("mouseUp")(e);
    return this.events.emitter("dragEnd")(e);
  }

  private _onMouseWheel = (e: MouseWheelEvent) => {
    return this.events.emitter("mouseWheel")(e);
  }
}

export type XYTuple = [number, number];

// A class for computing mouse interia for interial scrolling
export class InertialMouse {
  public static inertiaExtinction  = 0.1;
  public static smoothingTimeout   = 300;
  public static inertiaMsecDelay   = 30;

  private x: number;
  private y: number;
  private xy: XYTuple;
  private lastUpdate: Date;

  constructor() {
    this.reset();
  }

  public get(): XYTuple {
    const scale = 1000 / InertialMouse.inertiaMsecDelay;
    return [this.x * scale, this.y * scale];
  }

  public reset() {
    this.xy = [0, 0];
    return this;
  }

  public update(xy: XYTuple) {
    if (this.lastUpdate != null) {
      const msec = new Date().getTime() - this.lastUpdate.getTime(); // Time passed
      xy = xy.map(t => t / Math.max(msec, 1)) as XYTuple; // Pixels per milliseconds
      const t = Math.min(1, msec / InertialMouse.smoothingTimeout); // Interpolation based on time between measurements
      this.x = (t * xy[0]) + ((1.0 - t) * this.x);
      this.y = (t * xy[1]) + ((1.0 - t) * this.y);
    } else {
     [this.x, this.y] = xy;
   }

    this.lastUpdate = new Date();
    return this;
  }

  // Apply damping to slow the motion once the user has stopped dragging.
  public damp() {
    this.x *= (1.0 - InertialMouse.inertiaExtinction);
    this.y *= (1.0 - InertialMouse.inertiaExtinction);
    return this;
  }
}

export interface IDragOptions {
  inertia: boolean;
}

export interface IDragEvents {
  dragStart: (e: MouseEvent | TouchEvent) => void;
  drag: (e: IDragEvent) => void;
  dragEnd: (e: MouseEvent | TouchEvent) => void;
  dragEndInertia: () => void;
}

export interface IDragEvent {
  offset         : XYTuple,
  offsetRelative : XYTuple,
};

interface IDragState {
  dragging : boolean;
  origin   : XYTuple;
  last     : XYTuple;
  inertia  : InertialMouse;
}

// Adds simple mouse drag eventing to a DOM element. A 'drag' event is emitted
// as the user is dragging their mouse. This is the easiest way to add mouse-
// look or mouse-rotate to a scene.
export class Drag implements IDragOptions, EventRegistrar<IDragEvents>{
  public static defaults(): IDragOptions {
    return { inertia: false };
  }

  public inertia: boolean;
  private el: HTMLElement;
  private _inertiaRunning: boolean;
  private _dragState: IDragState;
  private events = new Events<IDragEvents>();
  public on = this.events.on;
  public off = this.events.off;

  constructor(el: HTMLElement, options: Partial<IDragOptions> = {}) {
    Util.defaults<IDragOptions>(this, options, Drag.defaults());
    this.el = Util.element(el);

    this._inertiaRunning = false;
    this._dragState = {
      dragging : false,
      origin   : null,
      last     : null,
      inertia  : new InertialMouse()
    };

    const mouser = new MouseEvents(this.el);
    mouser.on("dragStart", this._onDragStart);
    mouser.on("dragEnd", this._onDragEnd);
    mouser.on("drag", this._onDrag);
  }

  private _getPageCoords(e: MouseEvent | TouchEvent): XYTuple {
    const touch = e as TouchEvent;
    const mouse = e as MouseEvent;
    if (touch.touches != null && touch.touches.length > 0) {
      const { pageX, pageY } = touch.touches[0];
      return [ pageX, pageY ];
    } else if (touch.changedTouches != null && touch.changedTouches.length > 0) {
      const { pageX, pageY } = touch.changedTouches[0];
      return [ pageX, pageY ];
    } else {
      const { pageX, pageY } = mouse;
      return [ pageX, pageY ];
    }
  }

  private _onDragStart = (e: MouseEvent | TouchEvent) => {
    this._stopInertia();
    this._dragState.dragging = true;
    this._dragState.origin   = this._getPageCoords(e);
    this._dragState.last     = this._getPageCoords(e);
    return this.events.emitter("dragStart")(e);
  }

  private _onDragEnd = (e: MouseEvent | TouchEvent) => {
    this._dragState.dragging = false;

    if (this.inertia) {
      const page = this._getPageCoords(e);
      const dragEvent: IDragEvent = {
        offset         : [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
        offsetRelative : [page[0] - this._dragState.last[0], page[1] - this._dragState.last[1]]
      };

      this._dragState.inertia.update(dragEvent.offsetRelative);
      this._startInertia();
    }

    return this.events.emitter("dragEnd")(e);
  }

  private _onDrag = (e) => {
    const page = this._getPageCoords(e);

    const dragEvent: IDragEvent = {
      offset         : [page[0] - this._dragState.origin[0], page[1] - this._dragState.origin[1]],
      offsetRelative : [page[0] - this._dragState.last[0], page[1]- this._dragState.last[1]]
    };

    this.events.emitter("drag")(dragEvent);

    if (this.inertia) {
      this._dragState.inertia.update(dragEvent.offsetRelative);
    }

    return this._dragState.last = page;
  }

  private _onInertia = () => {
    if (!this._inertiaRunning) {
      return;
    }

    // Apply damping and get x,y intertia values
    const intertia = this._dragState.inertia.damp().get();

    if ((Math.abs(intertia[0]) < 1) && (Math.abs(intertia[1]) < 1)) {
      this._stopInertia();
      this.events.emitter("dragEndInertia")();
      return;
    }

    this.events.emitter("drag")({
      offset         : [this._dragState.last[0] - this._dragState.origin[0], this._dragState.last[0] - this._dragState.origin[1]],
      offsetRelative : intertia
    });
    this._dragState.last = [this._dragState.last[0] + intertia[0], this._dragState.last[1] + intertia[1]];

    return this._startInertia();
  }

  private _startInertia() {
    this._inertiaRunning = true;
    return setTimeout(this._onInertia, InertialMouse.inertiaMsecDelay);
  }

  private _stopInertia() {
    this._dragState.inertia.reset();
    return this._inertiaRunning = false;
  }
}

export interface IZoomOptions {
  speed: number;
}

export interface IZoomEvents {
  zoom: (zoom: number) => void;
}

// Adds simple mouse wheel eventing to a DOM element. A 'zoom' event is emitted
// as the user is scrolls their mouse wheel.
export class Zoom implements IZoomOptions, EventRegistrar<IZoomEvents> {

  public speed = 0.25;
  private el: HTMLElement;

  private events =  new Events<IZoomEvents>();
  public on = this.events.on;
  public off = this.events.off;

  constructor(el: HTMLElement, options: Partial<IZoomOptions> = {}) {
    this.el = Util.element(el);
    const mouser = new MouseEvents(this.el);
    mouser.on("mouseWheel", this._onMouseWheel);
  }

  _onMouseWheel(e: MouseWheelEvent) {
    // This prevents the page from scrolling when we mousewheel the element
    e.preventDefault();

    const sign       = e.wheelDelta / Math.abs(e.wheelDelta);
    const zoomFactor = (Math.abs(e.wheelDelta) / 120) * this.speed;
    const zoom       = Math.pow(2, sign*zoomFactor);

    return this.events.emitter("zoom")(zoom);
  }
}
