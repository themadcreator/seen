import { CanvasRenderContext } from "./canvas";
import { RenderContext } from "./context";
import { Scene } from "../scene";
import { SvgRenderContext } from "./svg";
import { Util } from "../util";

/**
 * Create a render context for the element with the specified `elementId`.
 * elementId should correspond to either an SVG or Canvas element.
 */
export const Context = (elementId: HTMLElement | string, scene: Scene) => {
    const tag = Util.element(elementId).tagName.toUpperCase();

    let context: RenderContext;
    switch (tag) {
        case "SVG":
        case "G":
            context = new SvgRenderContext(elementId);
            break;
        case "CANVAS":
            context = new CanvasRenderContext(elementId);
            break;
    }

    if (scene != null) {
        context.sceneLayer(scene);
    }

    return context;
};
