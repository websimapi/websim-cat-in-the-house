import nipplejs from 'nipplejs';

export class InputController {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
        };
        this.moveVector = { x: 0, y: 0 };
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);

        if ('ontouchstart' in window) {
            this.setupMobileControls();
        }
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.forward = true; break;
            case 'a': case 'arrowleft': this.keys.left = true; break;
            case 's': case 'arrowdown': this.keys.backward = true; break;
            case 'd': case 'arrowright': this.keys.right = true; break;
            case ' ': this.keys.jump = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.forward = false; break;
            case 'a': case 'arrowleft': this.keys.left = false; break;
            case 's': case 'arrowdown': this.keys.backward = false; break;
            case 'd': case 'arrowright': this.keys.right = false; break;
            case ' ': this.keys.jump = false; break;
        }
    }
    
    setupMobileControls() {
        const joystickContainer = document.getElementById('joystick-container');
        const jumpButton = document.getElementById('jump-button');

        const options = {
            zone: joystickContainer,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 150,
        };

        const manager = nipplejs.create(options);

        manager.on('move', (evt, data) => {
            if (data.angle && data.force) {
                const angle = data.angle.radian;
                const force = data.force;
                this.moveVector.x = Math.cos(angle) * force;
                this.moveVector.y = Math.sin(angle) * force;
            }
        });

        manager.on('end', () => {
            this.moveVector.x = 0;
            this.moveVector.y = 0;
        });

        jumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.jump = true;
        }, { passive: false });
        
        jumpButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.jump = false;
        });
    }
}

