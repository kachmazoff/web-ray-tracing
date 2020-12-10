import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper, Geometry, PointsMaterial, Points, Vector3, LineBasicMaterial, BufferGeometry, LineSegments, Vector2, Raycaster, MeshBasicMaterial, MathUtils } from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Ray } from "./Ray";
import { Sphere } from "./Sphere";
import { generateRays, generateRaysCircleStroke } from "./Rays";
import { Plane } from "./Plane";
import { trace } from "./RayTracer";

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
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});

// const sphereObj = new Sphere({ x: 0, y: 0, z: 0 }, 5)
// const sphereObjMesh = sphereObj.getMesh();
// scene.add(sphereObjMesh);

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
    const firstMesh = (intersects.find(x => x.object.type === 'Mesh' && x.object.material.type === 'MeshLambertMaterial') || {}).object
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
// const planeObj = new Plane(new Vector3(-10, 0, 0), { x: 1, y: 0.2, z: 0 });
scene.add(planeObj.getMesh())

const plane2Obj = new Plane(new Vector3(-20, 0, 10), { x: 1, y: 0, z: -1 });
scene.add(plane2Obj.getMesh())

const rays = generateRaysCircleStroke(4.95, 200, new Vector3(20, 0, -20), new Vector3(-1, 0, 0));
let reflectedRays = [];
const normalsRays = [];

const raysPoints = [];
const reflectedRaysPoints = [];
const normalsPoints = [];
const maxRecursionDepth = 5;

const objects = [planeObj, plane2Obj];
// const objects = [planeObj, sphereObj];

const intersections = trace(rays, objects, reflectedRays, maxRecursionDepth);
const intersections2 = trace(reflectedRays, objects, reflectedRays, maxRecursionDepth);

const dotGeometry = new Geometry();
const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });

intersections.forEach(x => { dotGeometry.vertices.push(x); });
intersections2.forEach(x => { dotGeometry.vertices.push(x); });

const dots = new Points(dotGeometry, dotMaterial);
dots.name = 'Intersects';
scene.add(dots);

rays.forEach(x => raysPoints.push(...x.getPoints()))
reflectedRays.forEach(x => reflectedRaysPoints.push(...x.getPoints()))
// normalsRays.forEach(x => normalsPoints.push(...x.getPoints(1)))

const raysGeometry = new BufferGeometry().setFromPoints(raysPoints);
const lines = new LineSegments(raysGeometry, rayMaterial); // //drawing separated lines
lines.name = 'PrimaryRays';

const reflectedRaysGeometry = new BufferGeometry().setFromPoints(reflectedRaysPoints);
const reflectedLines = new LineSegments(reflectedRaysGeometry, rayMaterial); // //drawing separated lines
reflectedLines.name = 'ReflectedRays';

// const normalsRaysGeometry = new BufferGeometry().setFromPoints(normalsPoints);
// const normalsMaterial = new LineBasicMaterial({ color: 0xffff00 });
// const normalsLines = new LineSegments(normalsRaysGeometry, normalsMaterial); // //drawing separated lines

scene.add(lines);
scene.add(reflectedLines);
// scene.add(normalsLines);

renderer.domElement.addEventListener('mousemove', onMouseMove);

const cubegeometry = new BoxGeometry(5, 5, 10);
const cubematerial = new MeshLambertMaterial({ color: 0x00ff00 });
const cube = new Mesh(cubegeometry, cubematerial);
scene.add(cube)

transformControls.attach(planeObj.getMesh());
scene.add(transformControls);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}
render();


window.addEventListener('keydown', function (event) {

    switch (event.keyCode) {

        case 81: // Q
            transformControls.setSpace(transformControls.space === "local" ? "world" : "local");
            break;

        case 16: // Shift
            transformControls.setTranslationSnap(100);
            transformControls.setRotationSnap(MathUtils.degToRad(15));
            transformControls.setScaleSnap(0.25);
            break;

        case 87: // W
            transformControls.setMode("translate");
            break;

        case 69: // E
            transformControls.setMode("rotate");
            break;

        case 82: // R
            transformControls.setMode("scale");
            break;

        case 187:
        case 107: // +, =, num+
            transformControls.setSize(transformControls.size + 0.1);
            break;

        case 189:
        case 109: // -, _, num-
            transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
            break;

        case 88: // X
            transformControls.showX = !transformControls.showX;
            break;

        case 89: // Y
            transformControls.showY = !transformControls.showY;
            break;

        case 90: // Z
            transformControls.showZ = !transformControls.showZ;
            break;

        case 32: // Spacebar
            transformControls.enabled = !transformControls.enabled;
            break;

    }

});

transformControls.addEventListener('change', event => {
    if (!event.target.children[1].object.position.equals(planeObj.position)) {
        planeObj.setPosition(event.target.children[1].object.position)
        scene.remove(scene.getObjectByName('Intersects'))
        scene.remove(scene.getObjectByName('ReflectedRays'))
        scene.remove(scene.getObjectByName('PrimaryRays'))

        reflectedRays = [];
        const intersections = trace(rays, objects, reflectedRays, maxRecursionDepth);
        const intersections2 = trace(reflectedRays, objects, reflectedRays, maxRecursionDepth);

        const dotGeometry = new Geometry();
        const dotMaterial = new PointsMaterial({ size: 5, sizeAttenuation: false });

        intersections.forEach(x => { dotGeometry.vertices.push(x); });
        intersections2.forEach(x => { dotGeometry.vertices.push(x); });

        const raysPoints = [];
        rays.forEach(x => raysPoints.push(...x.getPoints()))
        const raysGeometry = new BufferGeometry().setFromPoints(raysPoints);
        const lines = new LineSegments(raysGeometry, rayMaterial); // //drawing separated lines
        lines.name = 'PrimaryRays';
        scene.add(lines);

        const reflectedRaysPoints = [];
        reflectedRays.forEach(x => reflectedRaysPoints.push(...x.getPoints()))
        const reflectedRaysGeometry = new BufferGeometry().setFromPoints(reflectedRaysPoints);
        const reflectedLines = new LineSegments(reflectedRaysGeometry, rayMaterial); // //drawing separated lines
        reflectedLines.name = 'ReflectedRays';
        scene.add(reflectedLines);

        const dots = new Points(dotGeometry, dotMaterial);
        dots.name = 'Intersects';
        scene.add(dots);
    }
});

window.addEventListener('keyup', function (event) {

    switch (event.keyCode) {

        case 16: // Shift
            transformControls.setTranslationSnap(null);
            transformControls.setRotationSnap(null);
            transformControls.setScaleSnap(null);
            break;

    }

});
