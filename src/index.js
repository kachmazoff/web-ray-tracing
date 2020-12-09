import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper, Geometry, PointsMaterial, Points, Vector3, LineBasicMaterial, BufferGeometry, LineSegments, Vector2, Raycaster, CircleGeometry } from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Ray } from "./Ray";
import { Sphere } from "./Sphere";
import { vectorMinus } from "./utils/math";
import { generateRays } from "./Rays";
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

const sphere = generateSphere(5, { color: "#909000" })
// sphere.position.set(-10, 10, 5);
scene.add(sphere)

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

// var dotGeometry = new Geometry();
// dotGeometry.vertices.push(new Vector3( 10, 10, 0));
// var dotMaterial = new PointsMaterial( { size: 5, sizeAttenuation: false } );
// var dot = new Points( dotGeometry, dotMaterial );
// scene.add( dot );


const sphereObj = new Sphere({ x: 0, y: 0, z: 0 }, 5)

const ray = new Ray({ x: 0, y: 0, z: 5 }, vectorMinus({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }))

const material = new LineBasicMaterial({ color: 0x0000ff });
const points = [];
points.push(new Vector3(0, 0, 5));
points.push(new Vector3(-10, 10, 5));

console.log('new Vector3(0, 0, 5)', new Vector3(0, 0, 5))
console.log('new Vector3(0, 0, 5) - new Vector3(-10, 10, 5)', (new Vector3(0, 0, 5).sub(new Vector3(-10, 10, 5))))

const geometry = new BufferGeometry().setFromPoints(points);
const line = new LineSegments(geometry, material); // //drawing separated lines
scene.add(line);

const intersectInfo = sphereObj.intersect(ray.origin, ray.direction)
console.log(intersectInfo)
if (intersectInfo.intersect) {
    const pos = {
        x: ray.origin.x + intersectInfo.t0 * ray.direction.x,
        y: ray.origin.y + intersectInfo.t0 * ray.direction.y,
        z: ray.origin.z + intersectInfo.t0 * ray.direction.z,
    };

    const dotGeometry = new Geometry();
    dotGeometry.vertices.push(new Vector3(pos.x, pos.y, pos.z));
    const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });
    const dot = new Points(dotGeometry, dotMaterial);
    scene.add(dot);
}

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
    console.log(firstMesh)
    if (intersects.length > 0 && !!firstMesh) {
        if (selectedObject != firstMesh) {
            if (selectedObject) selectedObject.material.emissive.setHex(selectedObject.currentHex);

            selectedObject = firstMesh;
            console.log(selectedObject.material)
            selectedObject.currentHex = selectedObject.material.emissive.getHex();
            selectedObject.material.emissive.setHex(0xff0000);

        }

    } else {

        if (selectedObject) selectedObject.material.emissive.setHex(selectedObject.currentHex);

        selectedObject = null;

    }
}

const raysRaduis = 5;
const raysLength = 10;
const rays = generateRays(raysRaduis, 100);

const raysPoints = [];
const normalsPoints = [];
const reflectedPoints = [];

rays.forEach(ray => {
    raysPoints.push(new Vector3(ray.origin.x, ray.origin.y, ray.origin.z));
    raysPoints.push(new Vector3(
        ray.origin.x + ray.direction.x * raysLength,
        ray.origin.y + ray.direction.y * raysLength,
        ray.origin.z + ray.direction.z * raysLength,
    ));

    const intersectInfo = sphereObj.intersect(ray.origin, ray.direction)
    console.log(intersectInfo)
    if (intersectInfo.intersect) {
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
        
        const dir = new Vector3(ray.direction.x, ray.direction.y, ray.direction.z);
        dir.reflect(new Vector3(pos.x - sphereObj.position.x, pos.y - sphereObj.position.y, pos.z - sphereObj.position.z).normalize()).multiplyScalar(3)

        reflectedPoints.push(intersectPos);
        reflectedPoints.push(dir.add(intersectPos));

        normalsPoints.push(intersectPos)
        normalsPoints.push(new Vector3(pos.x - sphereObj.position.x, pos.y - sphereObj.position.y, pos.z - sphereObj.position.z).normalize().add(intersectPos))
    }
});
console.log(rays, raysPoints)
const raysGeometry = new BufferGeometry().setFromPoints(raysPoints);
const lines = new LineSegments(raysGeometry, material); // //drawing separated lines

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