import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper, Geometry, PointsMaterial, Points, Vector3 } from "three";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
scene.add(cube);
cube.rotation.set(0.4, 0.2, 0);


var light = new PointLight(0xFFFFFF);
light.position.set(-10, 0, 50);
scene.add(light);

function generateSphere(radius, { detalization, color }) {
    detalization = detalization || 20;

    const shereGeometry = new SphereGeometry(radius, detalization, detalization);
    const sphereMaterial = new MeshLambertMaterial({ color: color });
    const sphere = new Mesh(shereGeometry, sphereMaterial);

    return sphere;
}

const sphere = generateSphere(5, { color: "#909000" })
sphere.position.set(-10, 10, 5);
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

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}
render();