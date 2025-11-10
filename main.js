import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Player } from './player.js';
import { World } from './world.js';
import { InputController } from './input.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
            antialias: true,
        });
        this.clock = new THREE.Clock();
        this.player = null;
        this.world = null;
        this.input = null;

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 0, 100);

        this.setupLights();
        
        this.world = new World(this.scene);
        this.input = new InputController();
        this.player = new Player(this.scene, this.world);
        
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();

        if (this.player && this.player.model) {
            this.player.update(delta, this.input.keys, this.input.moveVector);
            this.updateCamera();
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        if (!this.player.model) return;

        const playerPosition = this.player.gameObject.position;
        const cameraOffset = new THREE.Vector3(0, 2.5, 4);
        
        // Rotate offset with player
        const playerRotation = this.player.gameObject.quaternion;
        cameraOffset.applyQuaternion(playerRotation);

        const targetPosition = new THREE.Vector3().addVectors(playerPosition, cameraOffset);
        this.camera.position.lerp(targetPosition, 0.1);
        
        const lookAtTarget = playerPosition.clone().add(new THREE.Vector3(0, 1, 0));
        this.camera.lookAt(lookAtTarget);
    }
}

const game = new Game();