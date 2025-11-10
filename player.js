import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;

        this.velocity = new THREE.Vector3();
        this.speed = 4;
        this.jumpStrength = 8;
        this.gravity = -20;
        this.onGround = false;

        this.playerCollider = new THREE.Box3();
        
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('rigged_black_cat_two.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.5, 0.5, 0.5);
            this.model.position.y = 1;
            
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.scene.add(this.model);

            this.mixer = new THREE.AnimationMixer(this.model);
            const walkAnimation = gltf.animations[0];
            if (walkAnimation) {
                this.animations.walk = this.mixer.clipAction(walkAnimation);
            }
        }, undefined, (error) => {
            console.error('Error loading player model', error);
        });
    }

    update(delta, keys, moveVector) {
        if (!this.model) return;

        const moveDirection = new THREE.Vector3(0, 0, 0);

        if (moveVector.length() > 0.1) {
             moveDirection.z = -moveVector.y;
             moveDirection.x = moveVector.x;
        } else {
            if (keys.forward) moveDirection.z = -1;
            if (keys.backward) moveDirection.z = 1;
            if (keys.left) moveDirection.x = -1;
            if (keys.right) moveDirection.x = 1;
        }

        // Apply gravity
        this.velocity.y += this.gravity * delta;
        
        // Jump
        if (keys.jump && this.onGround) {
            this.velocity.y = this.jumpStrength;
        }

        // Apply movement
        if (moveDirection.lengthSq() > 0) {
            moveDirection.normalize();
            
            const angle = Math.atan2(moveDirection.x, moveDirection.z);
            this.model.rotation.y = angle;

            // Move model in its forward direction
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.model.quaternion);
            this.velocity.x = forward.x * this.speed;
            this.velocity.z = forward.z * this.speed;
            
            if (this.animations.walk && this.currentAction !== 'walk') {
                this.playAnimation('walk');
            }
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
            if (this.currentAction === 'walk') {
               this.stopAnimation('walk');
            }
        }

        this.model.position.x += this.velocity.x * delta;
        this.model.position.z += this.velocity.z * delta;
        this.model.position.y += this.velocity.y * delta;

        this.handleCollisions();

        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
    
    handleCollisions() {
        if (!this.world || !this.model) return;

        this.playerCollider.setFromObject(this.model);

        this.onGround = false;

        // Floor collision
        if (this.model.position.y < 0.5) {
            this.model.position.y = 0.5;
            this.velocity.y = 0;
            this.onGround = true;
        }
        
        // Wall collisions
        this.world.colliders.forEach(collider => {
            if (this.playerCollider.intersectsBox(collider)) {
                const center = new THREE.Vector3();
                this.playerCollider.getCenter(center);

                const colliderCenter = new THREE.Vector3();
                collider.getCenter(colliderCenter);

                const overlap = this.playerCollider.clone().intersect(collider);
                const overlapSize = new THREE.Vector3();
                overlap.getSize(overlapSize);

                if (overlapSize.x < overlapSize.z) {
                    const sign = Math.sign(center.x - colliderCenter.x);
                    this.model.position.x += sign * overlapSize.x;
                } else {
                    const sign = Math.sign(center.z - colliderCenter.z);
                    this.model.position.z += sign * overlapSize.z;
                }
            }
        });
    }

    playAnimation(name) {
        if (this.currentAction === name || !this.animations[name]) return;
        
        const lastAction = this.animations[this.currentAction];
        const newAction = this.animations[name];

        if (lastAction) {
            lastAction.fadeOut(0.2);
        }

        newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.2).play();
        this.currentAction = name;
    }

    stopAnimation(name) {
        if (this.currentAction === name && this.animations[name]) {
            this.animations[name].fadeOut(0.2);
            this.currentAction = null;
        }
    }
}