import { Geometry, Points, PointsMaterial, Vector3 } from "three";
import { Ray } from "./Ray";

function getNearestIntersection(objects, ray) {
    let minT = 1e9;
    let intersect = false;
    let intersectedObject = undefined;

    objects.forEach(o => {
        const intersectInfo = o.intersect(ray.origin, ray.direction);
        if (intersectInfo.intersect && minT > intersectInfo.t0 && intersectInfo.t0 > 1e-9) {
            minT = intersectInfo.t0;
            intersect = true;
            intersectedObject = o;
        }
    });

    return {
        intersect,
        t: minT,
        intersectedObject
    }
}

function trace(rays, objects, reflectedRays, maxRecursionDepth) {
    const intersections = [];
    for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        if (ray.recursionDepth >= maxRecursionDepth) { continue; }

        const intersectInfo = getNearestIntersection(objects, ray);
        if (intersectInfo.intersect) {
            ray.setLength(intersectInfo.t);
            const pos = new Vector3().copy(ray.direction).multiplyScalar(intersectInfo.t).add(ray.origin);
            intersections.push(pos);

            const reflectedRayDirection = new Vector3().copy(ray.direction);
            reflectedRayDirection.reflect(intersectInfo.intersectedObject.getNormal(pos))

            reflectedRays.push(new Ray(pos, reflectedRayDirection, ray.recursionDepth + 1));

            // const dotGeometry = new Geometry();
            // const intersectPos = new Vector3(pos.x, pos.y, pos.z);
            // dotGeometry.vertices.push(intersectPos);
            // const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });
            // const dot = new Points(dotGeometry, dotMaterial);
            // scene.add(dot);

            
            // normalsRays.push(new Ray(intersectPos, intersectInfo.intersectedObject.getNormal(pos)));
        }
    }

    return intersections;
}

export { trace }
