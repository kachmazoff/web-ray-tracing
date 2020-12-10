import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper, Geometry, PointsMaterial, Points, Vector3, LineBasicMaterial, BufferGeometry, LineSegments, Vector2, Raycaster } from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Ray } from "./Ray";
import { Sphere } from "./Sphere";
import { generateRays, generateRaysCircleStroke } from "./Rays";
import { Plane } from "./Plane";
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor("#e5e5e5");
document.body.appendChild(renderer.domElement);

let scene = new Scene();

let camera = new PerspectiveCamera(70, WIDTH / HEIGHT);
camera.position.z = 50;
scene.add(camera);

var lightFront = new PointLight(0xFFFFFF);
lightFront.position.set(-10, 0, 50);
scene.add(lightFront);

var lightBack = new PointLight(0xFFFFFF);
lightBack.position.set(50, 0, -50);
scene.add(lightBack);

const size = 50;
const divisions = 10;

const gridHelper = new GridHelper(size, divisions);
scene.add(gridHelper);

console.log('scene.children', scene.children)
camera.rotateX(-0.6)
camera.translateY(20)
camera.translateZ(20)

function createControls() {

    let controls = new TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [65, 83, 68];

    return controls;
}

function createOrbitControl() {
    const controls = new OrbitControls(camera, renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 10;
    controls.maxDistance = 200;

    controls.maxPolarAngle = Math.PI;

    return controls
}

const controls = createOrbitControl();

const sphereObj = new Sphere({ x: 0, y: 0, z: 0 }, 5)
scene.add(sphereObj.getMesh());

const rayMaterial = new LineBasicMaterial({ color: 0x0000ff });

const raycaster = new Raycaster();
const mouse = new Vector2();

let selectedObject = undefined;

function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);
    const firstMesh = (intersects.find(x => x.object.type === 'Mesh') || {}).object
    if (intersects.length > 0 && !!firstMesh) {
        if (selectedObject != firstMesh) {
            if (selectedObject) { selectedObject.material.emissive.setHex(selectedObject.currentHex); }

            selectedObject = firstMesh;
            selectedObject.currentHex = selectedObject.material.emissive.getHex();
            selectedObject.material.emissive.setHex(0xff0000);
        }
    } else {
        if (selectedObject) { selectedObject.material.emissive.setHex(selectedObject.currentHex); }

        selectedObject = null;
    }
}

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

// const planeObj = new Plane(new Vector3(-20, 0, -10), { x: 1, y: 0, z: 1 });
const planeObj = new Plane(new Vector3(-10, 0, 0), { x: 1, y: 0.2, z: 0 });
scene.add(planeObj.getMesh())

// const plane2Obj = new Plane(new Vector3(-20, 0, 10), { x: 1, y: 0, z: -1 });
// scene.add(plane2Obj.getMesh())

const rays = generateRaysCircleStroke(4.95, 200, new Vector3(20, 0, 0), new Vector3(-1, 0, 0));
const normalsRays = [];

const raysPoints = [];
const normalsPoints = [];
const maxRecursionDepth = 5;

// const objects = [planeObj, plane2Obj, sphereObj];
const objects = [planeObj, sphereObj];

for (let i = 0; i < rays.length; i++) {
    const ray = rays[i];

    if (ray.recursionDepth >= maxRecursionDepth) { continue; }

    const intersectInfo = getNearestIntersection(objects, ray);
    if (intersectInfo.intersect) {
        ray.setLength(intersectInfo.t);
        const pos = {
            x: ray.origin.x + intersectInfo.t * ray.direction.x,
            y: ray.origin.y + intersectInfo.t * ray.direction.y,
            z: ray.origin.z + intersectInfo.t * ray.direction.z,
        };

        const dotGeometry = new Geometry();
        const intersectPos = new Vector3(pos.x, pos.y, pos.z);
        dotGeometry.vertices.push(intersectPos);
        const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });
        const dot = new Points(dotGeometry, dotMaterial);
        scene.add(dot);

        const reflectedRayDirection = new Vector3().copy(ray.direction);
        reflectedRayDirection.reflect(intersectInfo.intersectedObject.getNormal(pos))

        rays.push(new Ray(intersectPos, reflectedRayDirection, ray.recursionDepth + 1));
        normalsRays.push(new Ray(intersectPos, intersectInfo.intersectedObject.getNormal(pos)));
    }
}

rays.forEach(x => raysPoints.push(...x.getPoints()))
normalsRays.forEach(x => normalsPoints.push(...x.getPoints(1)))

const raysGeometry = new BufferGeometry().setFromPoints(raysPoints);
const lines = new LineSegments(raysGeometry, rayMaterial); // //drawing separated lines

const normalsRaysGeometry = new BufferGeometry().setFromPoints(normalsPoints);
const normalsMaterial = new LineBasicMaterial({ color: 0xffff00 });
const normalsLines = new LineSegments(normalsRaysGeometry, normalsMaterial); // //drawing separated lines

scene.add(lines);
scene.add(normalsLines);

renderer.domElement.addEventListener('mousemove', onMouseMove);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}
render();
