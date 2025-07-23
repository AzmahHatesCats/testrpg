// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

for (let i = 0; i < floor.geometry.attributes.position.count; i++) {
    const z = floor.geometry.attributes.position.getZ(i);
    floor.geometry.attributes.position.setZ(i, z + Math.random() * 20 - 10);
}
floor.geometry.attributes.position.needsUpdate = true;
floor.geometry.computeVertexNormals();

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 100, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);



// Player
const buildingSystem = new BuildingSystem(scene);

const player = {
    speed: 0.1,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    canJump: true,
    inventory: new Inventory()
};

player.inventory.addWeapon(new Weapon('Pistol', 10, 50));

// Controls
const controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    sprint: false,
    crouch: false
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
        case 'Space':
            if (player.canJump === true) controls.jump = true;
            break;
        case 'ShiftLeft':
            controls.sprint = true;
            break;
        case 'ControlLeft':
            controls.crouch = true;
            break;
        case 'KeyQ':
            buildingSystem.switchBuildable();
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
        case 'ShiftLeft':
            controls.sprint = false;
            break;
        case 'ControlLeft':
            controls.crouch = false;
            break;
    }
});

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
    }
});

document.body.addEventListener('click', (event) => {
    if (event.button === 0) { // Left-click
        document.body.requestPointerLock();
    } else if (event.button === 2) { // Right-click
        buildingSystem.placeBuildable();
    }
});

document.addEventListener('wheel', (event) => {
    if (document.pointerLockElement === document.body) {
        const direction = event.deltaY > 0 ? 1 : -1;
        player.inventory.switchWeapon(direction);
    }
});

camera.position.y = 1.8;

const mainMenu = document.getElementById('main-menu');
const optionsMenu = document.getElementById('options-menu');
const gameCanvas = document.getElementById('game-canvas');
const startButton = document.getElementById('start-button');
const optionsButton = document.getElementById('options-button');
const backButton = document.getElementById('back-button');
const fovSlider = document.getElementById('fov-slider');
const healthElement = document.getElementById('health');
const weaponElement = document.getElementById('weapon');
const ammoElement = document.getElementById('ammo');

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
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const newPlayer = new THREE.Mesh(geometry, material);
    newPlayer.position.set(data.position.x, data.position.y, data.position.z);
    newPlayer.castShadow = true;
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

    const speed = controls.sprint ? player.speed * 2 : player.speed;

    if (controls.moveForward || controls.moveBackward) {
        player.velocity.z -= player.direction.z * speed;
    }
    if (controls.moveLeft || controls.moveRight) {
        player.velocity.x -= player.direction.x * speed;
    }

    if (controls.jump) {
        player.velocity.y = 0.3;
        player.canJump = false;
        controls.jump = false;
    }

    player.velocity.y -= 0.01;

    camera.position.z += player.velocity.z;
    camera.position.x += player.velocity.x;
    camera.position.y += player.velocity.y;

    const crouchHeight = 1.2;
    const standingHeight = 1.8;
    const targetHeight = controls.crouch ? crouchHeight : standingHeight;

    camera.position.y += (targetHeight - camera.position.y) * 0.1;


    if (camera.position.y < standingHeight) {
        if (!controls.crouch) {
             camera.position.y = standingHeight;
        }
        player.canJump = true;
    }


    player.velocity.z *= 0.9;
    player.velocity.x *= 0.9;

    socket.emit('player update', {
        position: camera.position,
        rotation: camera.rotation
    });

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const position = intersect.point.add(intersect.face.normal);
        position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
        buildingSystem.updatePreview(position, new THREE.Euler(0, camera.rotation.y, 0));
    }

    const currentWeapon = player.inventory.getCurrentWeapon();
    if (currentWeapon) {
        weaponElement.innerText = `Weapon: ${currentWeapon.name}`;
    } else {
        weaponElement.innerText = 'Weapon: None';
    }


    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
