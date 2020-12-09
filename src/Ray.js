import { normalized } from "./utils/math";

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = normalized(direction);
    }
}

export { Ray }
