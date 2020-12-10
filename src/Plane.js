import { DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector3 } from "three";
import { normalized } from "./utils/math";

class Plane {
    constructor(position, normal, radius) {
        this.position = position;
        this.normal = normalized(normal);
        this.radius = normalized(radius);
    }

    intersect(rayOrigin, rayDirection) {
        const b = new Vector3().copy(this.normal).dot(rayDirection);
        if (-1e-9 < b && b < 1e-9) {
            return { intersect: false }
        }
        const t = new Vector3().copy(this.normal).dot(new Vector3().copy(this.radius).sub(rayOrigin).add(this.position)) / b;
        if (t < 0) {
            return { intersect: false }
        }
        return {
            intersect: true,
            t0: t
        };
    }

    getNormal() {
        return new Vector3().copy(this.normal);
    }

    getMesh(params) {
        const color = '#7d848a';
        const size = 20.0;
        if (!!params && !!params.color) { color = params.color; }
        if (!!params && !!params.size) { size = params.size; }

        const planeGeometry = new PlaneBufferGeometry(size, size, 1, 1);
        const planeMaterial = new MeshBasicMaterial({ color, side: DoubleSide });
        const plane = new Mesh(planeGeometry, planeMaterial);

        plane.lookAt(new Vector3().copy(this.normal));
        plane.position.set(this.position.x, this.position.y, this.position.z);

        return plane
    }
}

export { Plane }
