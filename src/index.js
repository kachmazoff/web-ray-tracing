import { Mesh, WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, MeshLambertMaterial, PointLight, SphereGeometry, GridHelper } from "three";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let renderer = new WebGLRenderer({antialias:true});
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor("#e5e5e5");
document.body.appendChild(renderer.domElement);

let scene = new Scene();

let camera = new PerspectiveCamera(70, WIDTH/HEIGHT);
camera.position.z = 50;
scene.add(camera);

var boxGeometry = new BoxGeometry(10, 10, 10);
var basicMaterial = new MeshLambertMaterial({color: 0x0095DD});
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

const gridHelper = new GridHelper( size, divisions );
scene.add( gridHelper );

console.log('scene.children', scene.children)
camera.rotateX(-0.6)
camera.translateY(20)
camera.translateZ(20)
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();