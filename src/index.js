import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper, Geometry, PointsMaterial, Points, Vector3, LineBasicMaterial, BufferGeometry, LineSegments, Vector2, Raycaster } from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Ray } from "./Ray";
import { Sphere } from "./Sphere";
import { generateRays } from "./Rays";
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

var boxGeometry = new BoxGeometry(10, 10, 10);
var basicMaterial = new MeshLambertMaterial({ color: 0x0095DD });
var cube = new Mesh(boxGeometry, basicMaterial);
// scene.add(cube);
cube.rotation.set(0.4, 0.2, 0);


var light = new PointLight(0xFFFFFF);
light.position.set(-10, 0, 50);
scene.add(light);

function generateSphere(radius, { detalization, color }) {
    detalization = detalization || 100;

    const shereGeometry = new SphereGeometry(radius, detalization, detalization);
    const sphereMaterial = new MeshLambertMaterial({ color: color });
    const sphere = new Mesh(shereGeometry, sphereMaterial);

    return sphere;
}

const sphere = generateSphere(3, { color: "#909000" })
// scene.add(sphere)

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

const sphereObj = new Sphere({ x: 0, y: 0, z: 0 }, 3)

const rayMaterial = new LineBasicMaterial({ color: 0x0000ff });

const raycaster = new Raycaster();
const mouse = new Vector2();

const cursorGeometry = new Geometry();
cursorGeometry.vertices.push(new Vector3());
const cursorMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false, color: '#ff0000' });
const cursor = new Points(cursorGeometry, cursorMaterial);
scene.add(cursor);

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

const planeObj = new Plane(new Vector3(-20, 0, -10), { x: 1, y: 0, z: 1 });
scene.add(planeObj.getMesh())

const plane2Obj = new Plane(new Vector3(-20, 0, 10), { x: 1, y: 0, z: -2 });
scene.add(plane2Obj.getMesh())

const raysRaduis = 5;
const rays = generateRays(raysRaduis, 200, new Vector3(20, 0, -10), new Vector3(-1, 0, 0));
const normalsRays = [];
const reflectedRays = [];

const raysPoints = [];
const normalsPoints = [];
const reflectedPoints = [];

rays.forEach(ray => {
    const intersectInfo = planeObj.intersect(ray.origin, ray.direction)
    if (intersectInfo.intersect) {
        ray.setLength(intersectInfo.t0);
        const pos = {
            x: ray.origin.x + intersectInfo.t0 * ray.direction.x,
            y: ray.origin.y + intersectInfo.t0 * ray.direction.y,
            z: ray.origin.z + intersectInfo.t0 * ray.direction.z,
        };

        const dotGeometry = new Geometry();
        const intersectPos = new Vector3(pos.x, pos.y, pos.z);
        dotGeometry.vertices.push(intersectPos);
        const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });
        const dot = new Points(dotGeometry, dotMaterial);
        scene.add(dot);

        const reflectedRayDirection = new Vector3().copy(ray.direction);
        reflectedRayDirection.reflect(planeObj.getNormal(pos))

        reflectedRays.push(new Ray(intersectPos, reflectedRayDirection));
        normalsRays.push(new Ray(intersectPos, planeObj.getNormal(pos)));
    }
});

reflectedRays.forEach(ray => {
    const intersectInfo = plane2Obj.intersect(ray.origin, ray.direction)
    if (intersectInfo.intersect) {
        ray.setLength(intersectInfo.t0);
        const pos = {
            x: ray.origin.x + intersectInfo.t0 * ray.direction.x,
            y: ray.origin.y + intersectInfo.t0 * ray.direction.y,
            z: ray.origin.z + intersectInfo.t0 * ray.direction.z,
        };

        const dotGeometry = new Geometry();
        const intersectPos = new Vector3(pos.x, pos.y, pos.z);
        dotGeometry.vertices.push(intersectPos);
        const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });
        const dot = new Points(dotGeometry, dotMaterial);
        scene.add(dot);

        const reflectedRayDirection = new Vector3().copy(ray.direction);
        reflectedRayDirection.reflect(plane2Obj.getNormal(pos))

        reflectedRays.push(new Ray(intersectPos, reflectedRayDirection));
        normalsRays.push(new Ray(intersectPos, plane2Obj.getNormal(pos)));
    }
});

rays.forEach(x => raysPoints.push(...x.getPoints()))
normalsRays.forEach(x => normalsPoints.push(...x.getPoints(1)))
reflectedRays.forEach(x => reflectedPoints.push(...x.getPoints()))

const raysGeometry = new BufferGeometry().setFromPoints(raysPoints);
const lines = new LineSegments(raysGeometry, rayMaterial); // //drawing separated lines

const refGeometry = new BufferGeometry().setFromPoints(reflectedPoints);
const refMaterial = new LineBasicMaterial({ color: 0x00f5ff });
const reflections = new LineSegments(refGeometry, refMaterial); // //drawing separated lines

const normalsRaysGeometry = new BufferGeometry().setFromPoints(normalsPoints);
const normalsMaterial = new LineBasicMaterial({ color: 0xffff00 });
const normalsLines = new LineSegments(normalsRaysGeometry, normalsMaterial); // //drawing separated lines

scene.add(lines);
scene.add(normalsLines);
scene.add(reflections);

renderer.domElement.addEventListener('mousemove', onMouseMove);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}
render();
