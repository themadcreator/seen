import { Ambient } from "./ambient";
import { DiffusePhong } from "./diffusePhong";
import { Flat } from "./flat";
import { Phong } from "./phong";

export * from "./ambient";
export * from "./diffusePhong";
export * from "./flat";
export * from "./phong";
export * from "./shader";

export const Shaders = {
    phong() {
        return new Phong();
    },
    diffuse() {
        return new DiffusePhong();
    },
    ambient() {
        return new Ambient();
    },
    flat() {
        return new Flat();
    },
};
