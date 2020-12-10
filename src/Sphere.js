import { Mesh, MeshLambertMaterial, SphereGeometry, Vector3 } from "three";
import { dotProduct } from "./utils/math";

class Sphere {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    intersect(rayOrigin, rayDirection) {
        const SO = {
            x: rayOrigin.x - this.position.x,
            y: rayOrigin.y - this.position.y,
            z: rayOrigin.z - this.position.z,
        };

        const dp = dotProduct(rayDirection, SO);
        const b = 2 * dp, c = dotProduct(SO, SO) - this.radius * this.radius;
        // t^2 + b * t + c = 0
        const discriminant = b * b - 4 * c;
        if (discriminant < 0) {
            return { intersect: false };
        }
        else {
            const t1 = (-b - Math.sqrt(discriminant)) / 2;
            return {
                intersect: true,
                t0: t1
            };
        }
    }

    getNormal(point) {
        return new Vector3().copy(point).sub(this.position).normalize();
    }

    getMesh(params) {
        let color = '#b7b7b7';
        if (!!params && !!params.color) { color = params.color; }
        
        const shereGeometry = new SphereGeometry(this.radius, 100, 100);
        const sphereMaterial = new MeshLambertMaterial({ color: color });
        const sphere = new Mesh(shereGeometry, sphereMaterial);
        
        sphere.position.set(this.position.x, this.position.y, this.position.z);

        return sphere;
    }
}

export { Sphere }
