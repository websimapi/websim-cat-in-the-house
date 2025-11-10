import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.createWorld();
    }

    createWorld() {
        const textureLoader = new THREE.TextureLoader();
        const woodFloorTexture = textureLoader.load('wood_floor.png');
        woodFloorTexture.wrapS = THREE.RepeatWrapping;
        woodFloorTexture.wrapT = THREE.RepeatWrapping;
        woodFloorTexture.repeat.set(10, 10);

        const wallpaperTexture = textureLoader.load('wallpaper.png');
        wallpaperTexture.wrapS = THREE.RepeatWrapping;
        wallpaperTexture.wrapT = THREE.RepeatWrapping;
        wallpaperTexture.repeat.set(10, 2);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(30, 30);
        const floorMaterial = new THREE.MeshStandardMaterial({ map: woodFloorTexture });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls
        const wallHeight = 5;
        const wallThickness = 0.5;
        const wallMaterial = new THREE.MeshStandardMaterial({ map: wallpaperTexture });

        const wallsData = [
            { size: [30, wallHeight, wallThickness], position: [0, wallHeight / 2, -15] }, // Back wall
            { size: [30, wallHeight, wallThickness], position: [0, wallHeight / 2, 15] },  // Front wall
            { size: [wallThickness, wallHeight, 30], position: [-15, wallHeight / 2, 0] }, // Left wall
            { size: [wallThickness, wallHeight, 30], position: [15, wallHeight / 2, 0] }   // Right wall
        ];

        wallsData.forEach(data => {
            this.createWall(data.size, data.position, wallMaterial);
        });

        // Interior objects (simple boxes for now)
        this.createBoxCollider([5, 2, 3], [-10, 1, -5], new THREE.Color(0x8B4513)); // Sofa
        this.createBoxCollider([2, 1.5, 2], [10, 0.75, 8], new THREE.Color(0xA0522D)); // Table
        this.createBoxCollider([4, 4, 0.5], [8, 2, -14.75], new THREE.Color(0xD2B48C)); // Bookshelf
    }

    createWall(size, position, material) {
        const wallGeometry = new THREE.BoxGeometry(...size);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(...position);
        wall.receiveShadow = true;
        this.scene.add(wall);

        const wallCollider = new THREE.Box3().setFromObject(wall);
        this.colliders.push(wallCollider);
    }

    createBoxCollider(size, position, color) {
        const boxGeo = new THREE.BoxGeometry(...size);
        const boxMat = new THREE.MeshStandardMaterial({ color });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.set(...position);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        this.scene.add(boxMesh);

        const boxCollider = new THREE.Box3().setFromObject(boxMesh);
        this.colliders.push(boxCollider);
    }
}