import { IRenderLayerContext } from "./context";
import { Scene } from "../scene";

export interface RenderLayer {
    render: (context: IRenderLayerContext) => void;
}

export class SceneLayer implements RenderLayer {
    constructor(private scene: Scene) {}

    public render(context: IRenderLayerContext) {
        const renderModels = this.scene.render();
        for (const renderModel of renderModels) {
            renderModel.surface.painter.paint(renderModel, context);
        }
    }
}

export class FillLayer implements RenderLayer {
    constructor(private width: number, private height: number, private fill: string) {}

    public render(context: IRenderLayerContext) {
        context
            .rect()
            .rect(this.width, this.height)
            .fill({ fill: this.fill });
    }
}
