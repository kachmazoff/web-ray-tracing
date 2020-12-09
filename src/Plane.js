import { Vector3 } from "three";
import { normalized } from "./utils/math";

class Plane {
    constructor(normal, radius) {
        this.normal = normalized(normal);
        this.radius = normalized(radius);
    }

    intersect(rayOrigin, rayDirection) {
        const t = new Vector3().copy(this.normal).dot(new Vector3().copy(this.radius).sub(rayOrigin)) / new Vector3().copy(this.normal).dot(rayDirection);
        return {
            intersect: true,
            t0: t
        };
    }

    getNormal() {
        return new Vector3().copy(this.normal);
    }
}

export { Plane }
