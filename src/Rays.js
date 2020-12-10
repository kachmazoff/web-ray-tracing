import { Vector3 } from "three";
import { Ray } from "./Ray";

function generateRays(radius, raysCount, center, commonDirection) {
    const rays = [];
    for (let i = 0; i < raysCount; i++) {
        const randomPoint = new Vector3().random();
        randomPoint.x = 0;
        randomPoint.normalize();
        
        randomPoint.y *= (Math.random() * 2 - 1) * radius;
        randomPoint.z *= (Math.random() * 2 - 1) * radius;
    
        rays.push(new Ray(randomPoint.add(center), commonDirection));
    }

    return rays;
}

export { generateRays }
