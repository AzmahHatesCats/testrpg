// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a floor
const floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// Add some walls
const wallGeometry = new THREE.BoxGeometry(100, 10, 1);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xA52A2A });
const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
wall1.position.z = 50;
wall1.position.y = 5;
scene.add(wall1);

const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
wall2.position.z = -50;
wall2.position.y = 5;
scene.add(wall2);

const wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
wall3.rotation.y = Math.PI / 2;
wall3.position.x = 50;
wall3.position.y = 5;
scene.add(wall3);

const wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
wall4.rotation.y = Math.PI / 2;
wall4.position.x = -50;
wall4.position.y = 5;
scene.add(wall4);


// Player
const player = {
    speed: 0.1,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3()
};

// Controls
const controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false
};

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            controls.moveForward = true;
            break;
        case 'KeyS':
            controls.moveBackward = true;
            break;
        case 'KeyA':
            controls.moveLeft = true;
            break;
        case 'KeyD':
            controls.moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            controls.moveForward = false;
            break;
        case 'KeyS':
            controls.moveBackward = false;
            break;
        case 'KeyA':
            controls.moveLeft = false;
            break;
        case 'KeyD':
            controls.moveRight = false;
            break;
    }
});

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
    }
});

document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

camera.position.y = 1.8;

const mainMenu = document.getElementById('main-menu');
const optionsMenu = document.getElementById('options-menu');
const gameCanvas = document.getElementById('game-canvas');
const startButton = document.getElementById('start-button');
const optionsButton = document.getElementById('options-button');
const backButton = document.getElementById('back-button');
const fovSlider = document.getElementById('fov-slider');

startButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameCanvas.style.display = 'block';
    document.body.requestPointerLock();
});

optionsButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    optionsMenu.style.display = 'block';
});

backButton.addEventListener('click', () => {
    optionsMenu.style.display = 'none';
    mainMenu.style.display = 'block';
});

fovSlider.addEventListener('input', () => {
    camera.fov = fovSlider.value;
    camera.updateProjectionMatrix();
});

const socket = io();
const players = {};

socket.on('current players', (initialPlayers) => {
    for (const id in initialPlayers) {
        if (id !== socket.id) {
            addPlayer(id, initialPlayers[id]);
        }
    }
});

socket.on('player update', (data) => {
    if (players[data.id]) {
        players[data.id].position.set(data.data.position.x, data.data.position.y, data.data.position.z);
        players[data.id].rotation.set(data.data.rotation.x, data.data.rotation.y, data.data.rotation.z);
    } else {
        addPlayer(data.id, data.data);
    }
});

socket.on('shoot', (data) => {
    const projectileGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    projectile.position.set(data.data.position.x, data.data.position.y, data.data.position.z);
    projectile.velocity = new THREE.Vector3(data.data.velocity.x, data.data.velocity.y, data.data.velocity.z);

    projectiles.push(projectile);
    scene.add(projectile);
});

socket.on('player disconnected', (id) => {
    if (players[id]) {
        scene.remove(players[id]);
        delete players[id];
    }
});

function addPlayer(id, data) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const newPlayer = new THREE.Mesh(geometry, material);
    newPlayer.position.set(data.position.x, data.position.y, data.position.z);
    players[id] = newPlayer;
    scene.add(newPlayer);
}

// Gun
const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const gun = new THREE.Mesh(gunGeometry, gunMaterial);
camera.add(gun);
gun.position.set(0.2, -0.2, -0.3);

const projectiles = [];

document.addEventListener('click', () => {
    if (document.pointerLockElement === document.body) {
        const projectileGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

        const vector = new THREE.Vector3(0, 0, -1);
        vector.applyQuaternion(camera.quaternion);

        projectile.position.copy(camera.position);
        projectile.velocity = vector.multiplyScalar(1);

        projectiles.push(projectile);
        scene.add(projectile);

        socket.emit('shoot', {
            position: projectile.position,
            velocity: projectile.velocity
        });
    }
});

// Game loop
function animate() {
    requestAnimationFrame(animate);

    projectiles.forEach(p => {
        p.position.add(p.velocity);
    });

    player.direction.z = Number(controls.moveForward) - Number(controls.moveBackward);
    player.direction.x = Number(controls.moveLeft) - Number(controls.moveRight);
    player.direction.normalize();

    if (controls.moveForward || controls.moveBackward) {
        player.velocity.z -= player.direction.z * player.speed;
    }
    if (controls.moveLeft || controls.moveRight) {
        player.velocity.x -= player.direction.x * player.speed;
    }

    camera.position.z += player.velocity.z;
    camera.position.x += player.velocity.x;

    player.velocity.z *= 0.9;
    player.velocity.x *= 0.9;

    socket.emit('player update', {
        position: camera.position,
        rotation: camera.rotation
    });

    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
