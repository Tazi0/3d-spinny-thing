/*       CONFIGURATION       */

var config = {
    width: 300,
    height: 400,
    object: 'WaltHead'
}

/* ------------------------- */


import * as THREE from './three.module.js';
import {OBJLoader} from './OBJLoader.js';
import {MTLLoader} from './MTLLoader.js';

var activeScenes = [];
var active = null;

init('WaltHead');
init("male02");

function init(model = config.object, width = config.width, height = config.height) {

    var camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    camera.position.z = 100;

    var scene = new THREE.Scene();
    var object;

    // model loader
    var materialLoad = new MTLLoader()
    materialLoad.load(`models/${model}.mtl`, function (materials) {
        // Load the materials
        materials.preload()

        var objectLoad = new OBJLoader();
        objectLoad.setMaterials(materials)
        objectLoad.load(`models/${model}.obj`, function (obj) {
            // Add the object
            object = obj;
            object.scale.multiplyScalar(0.8);
            object.position.y = -30;
            scene.add(object);
            fitCameraToObject(camera, object)
        });
    })

    // Add lighting
    var light = new THREE.SpotLight(0xffffff);
    light.position.set(-50, 10, 50.474);
    scene.add(light);

    // Lighting help
    // var lightHelper = new THREE.SpotLightHelper( light );
    // scene.add( lightHelper );

    //renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    var box = document.createElement("div")
    box.id = activeScenes.length
    box.className = "3d"
    document.body.appendChild(box)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor( 0x000000, 0 );
    box.appendChild(renderer.domElement);
    activeScenes.push([scene, renderer, camera])
    // console.log(scene);
}

function animate() {
    requestAnimationFrame(animate);
    for (let i = 0; i < activeScenes.length; i++) {
        const e = activeScenes[i];
        var scene = e[0]
        var renderer = e[1]
        var camera = e[2]
        if(active != null && active == i) {
            if (scene.children[1]) scene.children[1].rotation.y += 0.009;
        }
        renderer.render(scene, camera);
    }
}

window.addEventListener("mouseover", function (e) {
    if(e.target.localName == "canvas") {
        active = e.target.parentElement.id
        
        
        // for (let i = 0; i < canvases.length; i++) {
        //     const a = canvases[i];
        //     if(a == e.target) {
        //         active = i
        //     }
        // }
        
    } else {
        active = null
    }
})

window.addEventListener('mouseout', e => {
    if( e.y <= 0 ||
        e.y >= window.innerHeight ||
        e.x <= 0 ||
        e.x >= window.innerWidth ) {
        active = null
    }
})


animate()

const fitCameraToObject = function ( camera, object ) {
    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/3
    var offset = 1.25;
    const boundingBox = new THREE.Box3();

    boundingBox.setFromObject( object );

    const center = boundingBox.getCenter();
    const size = boundingBox.getSize();
    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = camera.fov * ( Math.PI / 180 );
    let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

    cameraZ *= offset;
    camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();
    camera.lookAt( center )
}
