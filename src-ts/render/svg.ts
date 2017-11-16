import { RenderContext, IRenderLayerContext } from "./context";
import { Point } from "../geometry/point";
import { Util } from "../util";
import { RenderLayer } from "./layers";
import { Scene } from "../scene";
import { IPathPainter, IRectPainter, ITextPainter, ICirclePainter, ITextStyle, IFillStyle, IStrokeStyle } from "./painters";

// ## SVG Context
// ------------------

type SvgElementFactory = (tag: string) => SVGElement;

// Creates a new SVG element in the SVG namespace.
const svg: SvgElementFactory = (tag: string) => document.createElementNS('http://www.w3.org/2000/svg', tag);

export class SvgStyler {
  public _attributes: any = {};
  public _svgTag: string = 'g';
  protected elementFactory: SvgElementFactory;

  constructor(elementFactory: (tag: string) => SVGElement) {
    this.elementFactory = elementFactory;
  }

  public clear() {
    this._attributes = {};
    return this;
  }

  public fill(style: IFillStyle = {}) {
    this._paint(style);
    return this;
  }

  public draw(style: IStrokeStyle = {}) {
    this._paint(style);
    return this;
  }

  private _paint(style: IFillStyle | IStrokeStyle) {
    let value;
    const el = this.elementFactory(this._svgTag);

    let str = '';
    for (var key in style) {
      value = style[key];
      str += `${key}:${value};`;
    }
    el.setAttribute('style', str);

    for (key in this._attributes) {
      value = this._attributes[key];
      el.setAttribute(key, value);
    }
    return el;
  }
}

export class SvgPathPainter extends SvgStyler implements IPathPainter {
  public _svgTag = 'path';
  public path(points: Point[]) {
    this._attributes.d = `M${points.map(p => `${p.x} ${p.y}`).join('L')}`;
    return this;
  }
}

export class SvgTextPainter extends SvgStyler implements ITextPainter {
  public _svgTag = 'text';

  public fillText(m: number[], text: string, style: ITextStyle) {
    if (style == null) { style = {}; }
    const el = this.elementFactory(this._svgTag);
    el.setAttribute('transform', `matrix(${m[0]} ${m[3]} ${-m[1]} ${-m[4]} ${m[2]} ${m[5]})`);

    let str = '';
    for (let key in style) {
      const value = style[key];
      if (value != null) { str += `${key}:${value};`; }
    }
    el.setAttribute('style', str);
    el.textContent = text;
    return this;
  }
}


export class SvgRectPainter extends SvgStyler implements IRectPainter {
  static initClass() {
    this.prototype._svgTag  = 'rect';
  }

  public rect(width: number, height: number) {
    this._attributes.width  = width;
    this._attributes.height = height;
    return this;
  }
}

export class SvgCirclePainter extends SvgStyler implements ICirclePainter {
  static initClass() {
    this.prototype._svgTag  = 'circle';
  }

  public circle(center: Point, radius: number) {
    this._attributes.cx = center.x;
    this._attributes.cy = center.y;
    this._attributes.r  = radius;
    return this;
  }
}

export class SvgLayerRenderContext implements IRenderLayerContext {
  private pathPainter   : SvgPathPainter;
  private textPainter   : SvgTextPainter;
  private circlePainter : SvgCirclePainter;
  private rectPainter   : SvgRectPainter;
  private _i = 0;

  constructor(private group: SVGGElement) {
    this.pathPainter   = new SvgPathPainter(this._elementFactory);
    this.textPainter   = new SvgTextPainter(this._elementFactory);
    this.circlePainter = new SvgCirclePainter(this._elementFactory);
    this.rectPainter   = new SvgRectPainter(this._elementFactory);
  }

  public path() {
    return this.pathPainter.clear();
  }
  public rect() { return this.rectPainter.clear(); }
  public circle() { return this.circlePainter.clear(); }
  public text() { return this.textPainter; }

  public reset() {
    return this._i = 0;
  }

  public cleanup() {
    const children = this.group.childNodes;
      while (this._i < children.length) {
        (children[this._i] as SVGElement).setAttribute('style', 'display: none;');
        this._i++;
      }
  }

  // Returns an element with tagname `type`.
  //
  // This method uses an internal iterator to add new elements as they are
  // drawn. If there is no child element at the current index, we append one
  // and return it. If an element exists at the current index and it is the
  // same type, we return that. If the element is a different type, we create
  // one and replace it then return it.
  _elementFactory(type: string) {
    let path;
    const children = this.group.childNodes;
    if (this._i >= children.length) {
      path = svg(type);
      this.group.appendChild(path);
      this._i++;
      return path;
    }

    const current = children[this._i];
    if ((current as SVGElement).tagName === type) {
      this._i++;
      return current;
    } else {
      path = svg(type);
      this.group.replaceChild(path, current);
      this._i++;
      return path;
    }
  }
};

export class SvgRenderContext extends RenderContext {
  private svg: SVGElement;
  constructor(svg: HTMLElement | string) {
    super();
    this.svg = Util.element(svg) as any as SVGElement;
  }

  public layer(layer: RenderLayer) {
    const group = svg("g") as SVGGElement;
    this.svg.appendChild(group);
    this.layers.push({
      layer,
      context : new SvgLayerRenderContext(group)
    });
    return this;
  }
};

export const SvgContext = (elementId: string, scene?: Scene) => {
  const context = new SvgRenderContext(elementId);
  if (scene != null) { context.sceneLayer(scene); }
  return context;
};
