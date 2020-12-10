import { Vector3 } from "three";
import { normalized } from "./utils/math";

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = normalized(direction);
        this.length = 100;
    }

    getPoints(rayLength) {
        return [
            new Vector3().copy(this.origin),
            new Vector3().copy(this.direction).multiplyScalar(rayLength || this.length).add(this.origin)
        ]
    }

    setLength(newLength) {
        this.length = newLength;
    }
}

export { Ray }
