import { Vector3 } from "three";
import { normalized } from "./utils/math";

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = normalized(direction);
    }

    getPoints(length = 3) {
        return [
            new Vector3().copy(this.origin),
            new Vector3().copy(this.direction).multiplyScalar(length).add(this.origin)
        ]
    }
}

export { Ray }
