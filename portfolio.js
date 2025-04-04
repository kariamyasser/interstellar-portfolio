// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000); // Increased far plane for larger distances
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Add a second directional light for better shadows and texture details
const secondaryLight = new THREE.DirectionalLight(0xffffcc, 0.8);
secondaryLight.position.set(-5, -10, 5);
scene.add(secondaryLight);

// Add specular highlights for planets to enhance texture appearance
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(0, 30, 0);
scene.add(pointLight);

// Create spaceship based on the photo
let spaceship = createSpaceshipFromPhoto(scene);
scene.add(spaceship);

// Particle trail for the spaceship
const trailParticles = createTrailParticles();
scene.add(trailParticles);

// -------------------- ORBITAL SYSTEM SETUP --------------------

// Create center objects first
// Add sun-like star with texture - MUCH LARGER
const sunGeometry = new THREE.SphereGeometry(50, 64, 64);
const sunTexture = textureLoader.load('./textures/sun.png');
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    emissive: 0xffaa00,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, -600); // Centered position for orbits
scene.add(sun);

// Add sun glow
const sunGlowGeometry = new THREE.SphereGeometry(60, 32, 32);
const sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
});
const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
sunGlow.position.copy(sun.position);
scene.add(sunGlow);

// Add black hole - MUCH LARGER, LARGEST OBJECT - Now central with the sun orbiting it
const blackHoleGeometry = new THREE.SphereGeometry(100, 80, 80);
const blackHoleMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.8
});
const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
blackHole.position.set(0, 0, -1500); // Centered but far away
scene.add(blackHole);

// Add accretion disk for black hole
const blackHoleRingTexture = textureLoader.load('./textures/blackhole_ring.jpg');
const accretionDiskGeometry = new THREE.RingGeometry(110, 200, 80);
const accretionDiskMaterial = new THREE.MeshBasicMaterial({
    map: blackHoleRingTexture,
    side: THREE.DoubleSide,
    transparent: true,
    emissive: 0xff5500,
    emissiveIntensity: 1
});
const accretionDisk = new THREE.Mesh(accretionDiskGeometry, accretionDiskMaterial);
accretionDisk.position.copy(blackHole.position);
accretionDisk.rotation.x = Math.PI / 3;
scene.add(accretionDisk);

// Create container for the sun system (all planets + sun)
const sunSystem = new THREE.Group();
sunSystem.position.copy(sun.position);
scene.add(sunSystem);
sunSystem.add(sun);
sunSystem.add(sunGlow);

// Move sun to origin within its system
sun.position.set(0, 0, 0);
sunGlow.position.set(0, 0, 0);

// Create planets with textures - INCREASED SIZES AND DISTANCES
const planets = [];
const planetData = [
    {
        name: 'Work Experience',
        distance: 200, // Distance from sun
        orbitalSpeed: 0.0003,
        orbitalOffset: 0, // Starting angle
        textureUrl: './textures/1.jpg',
        normalMapUrl: './textures/1.jpg',
        hasData: true,
        size: 15
    },
    {
        name: 'Skills',
        distance: 350,
        orbitalSpeed: 0.0004,
        orbitalOffset: Math.PI / 2, // 90 degrees offset
        textureUrl: './textures/2.jpg',
        normalMapUrl: null,
        hasData: true,
        size: 18
    },
    {
        name: 'Education',
        distance: 500,
        orbitalSpeed: 0.0002,
        orbitalOffset: Math.PI, // 180 degrees offset
        textureUrl: './textures/3.jpg',
        normalMapUrl: null,
        hasData: true,
        size: 16
    },
    {
        name: 'Planet 1',
        distance: 650,
        orbitalSpeed: 0.00015,
        orbitalOffset: Math.PI * 1.5, // 270 degrees offset
        textureUrl: './textures/4.jpg',
        normalMapUrl: null,
        hasData: false,
        size: 12
    },
    {
        name: 'Planet 2',
        distance: 800,
        orbitalSpeed: 0.00025,
        orbitalOffset: Math.PI / 4, // 45 degrees offset
        textureUrl: './textures/6.jpg',
        normalMapUrl: null,
        hasData: false,
        hasRings: true,
        ringTextureUrl: './textures/5.png',
        size: 14,
        ringInnerRadius: 16,
        ringOuterRadius: 28
    },
    {
        name: 'Planet 3',
        distance: 950,
        orbitalSpeed: 0.0003,
        orbitalOffset: Math.PI / 3, // 60 degrees offset
        textureUrl: './textures/8.jpg',
        normalMapUrl: null,
        hasData: false,
        size: 13
    },
    {
        name: 'Planet 4',
        distance: 1100,
        orbitalSpeed: 0.00018,
        orbitalOffset: Math.PI * 0.8, // ~145 degrees offset
        textureUrl: './textures/7.jpg',
        normalMapUrl: null,
        hasData: false,
        hasRings: true,
        ringTextureUrl: './textures/5.png',
        size: 17,
        ringInnerRadius: 19,
        ringOuterRadius: 32
    }
];

// Create planets with textures
planetData.forEach((data) => {
    // Create a group for the planet's orbital system
    const planetOrbit = new THREE.Group();
    planetOrbit.rotation.y = data.orbitalOffset; // Set initial position in orbit
    sunSystem.add(planetOrbit);
    
    // Create planet sphere with texture
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const texture = textureLoader.load(data.textureUrl);

    // Material properties
    const materialProps = {
        map: texture,
        roughness: 0.7,
        metalness: 0.2
    };

    // Add normal map if available
    if (data.normalMapUrl) {
        materialProps.normalMap = textureLoader.load(data.normalMapUrl);
        materialProps.normalScale = new THREE.Vector2(2, 2);
    }

    const material = new THREE.MeshStandardMaterial(materialProps);

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(data.distance, 0, 0); // Position along x-axis for circular orbit
    planet.castShadow = true;
    planet.receiveShadow = true;
    planetOrbit.add(planet); // Add to orbit group instead of directly to scene

    // Add glowing atmosphere for data planets
    if (data.hasData) {
        // Create atmospheric glow
        const glowGeometry = new THREE.SphereGeometry(data.size * 1.15, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x88aaff),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(planet.position);
        planetOrbit.add(glow);
    }

    // Add rings for some planets
    if (data.hasRings) {
        const ringInnerRadius = data.ringInnerRadius || data.size * 1.3;
        const ringOuterRadius = data.ringOuterRadius || data.size * 2;
        
        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 64);
        const ringTexture = textureLoader.load(data.ringTextureUrl);

        const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(planet.position);
        ring.rotation.x = Math.PI / 2;
        planetOrbit.add(ring);
    }

    planets.push({ 
        mesh: planet, 
        name: data.name, 
        hasData: data.hasData,
        orbit: planetOrbit,
        orbitalSpeed: data.orbitalSpeed,
        distance: data.distance
    });
});

// Enhanced stars background with better rendering - EXTENDED RANGE
const starGeometry = new THREE.BufferGeometry();
const starCount = 8000;  // More stars for larger space
const starVertices = [];
const starSizes = [];
const starColors = [];

for (let i = 0; i < starCount; i++) {
    starVertices.push((Math.random() - 0.5) * 4000);  // Increased range for larger space
    starVertices.push((Math.random() - 0.5) * 4000);  // Increased range
    starVertices.push((Math.random() - 0.5) * 4000);  // Increased range

    starSizes.push(Math.random() * 3 + 0.5);

    const starColor = new THREE.Color();
    const colorChoice = Math.random();
    if (colorChoice > 0.9) {
        starColor.setRGB(0.9, 0.6, 0.6); // Reddish
    } else if (colorChoice > 0.8) {
        starColor.setRGB(0.6, 0.6, 0.9); // Bluish
    } else if (colorChoice > 0.7) {
        starColor.setRGB(0.9, 0.9, 0.6); // Yellowish
    } else {
        starColor.setRGB(1, 1, 1); // White
    }

    starColors.push(starColor.r, starColor.g, starColor.b);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    sizeAttenuation: true
});
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 3000; // Increased for larger space

// Spaceship movement
const keys = { w: false, s: false, a: false, d: false };
document.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
});

// Added for smooth spaceship movement
const spaceshipVelocity = {
    x: 0,
    y: 0,
    z: 0
};

// Check for planet proximity - ADJUSTED FOR LARGER PLANETS AND ORBITS
function checkPlanetProximity() {
    if (!spaceship) return;

    let inProximity = false;
    planets.forEach(({ mesh, name, hasData, orbit }) => {
        // Get world position of the planet
        const planetWorldPos = new THREE.Vector3();
        mesh.getWorldPosition(planetWorldPos);
        
        const distance = spaceship.position.distanceTo(planetWorldPos);
        const proximityThreshold = mesh.geometry.parameters.radius * 3;  // Dynamic threshold based on planet size
        
        if (distance < proximityThreshold && hasData) {
            showInfo(name);
            smoothCameraTransition(planetWorldPos);
            inProximity = true;
        }
    });

    if (!inProximity) {
        hideInfo();
    }
}

// Display resume information
function showInfo(planetName) {
    const infoBox = document.getElementById('infoBox') || createInfoBox();
    infoBox.innerHTML = `
        <h2>${planetName}</h2>
        <p>Details from resume...</p>
        <button id="closeInfoBtn">Return to Ship</button>
    `;
    infoBox.style.display = 'block';

    document.getElementById('closeInfoBtn').addEventListener('click', () => {
        hideInfo();
        returnToShipView();
    });
}

// Create info box if it doesn't exist
function createInfoBox() {
    const infoBox = document.createElement('div');
    infoBox.id = 'infoBox';
    infoBox.style.position = 'absolute';
    infoBox.style.top = '20px';
    infoBox.style.right = '20px';
    infoBox.style.padding = '20px';
    infoBox.style.backgroundColor = 'rgba(0, 0, 30, 0.8)';
    infoBox.style.color = 'white';
    infoBox.style.borderRadius = '10px';
    infoBox.style.maxWidth = '300px';
    infoBox.style.zIndex = '1000';
    infoBox.style.display = 'none';
    document.body.appendChild(infoBox);
    return infoBox;
}

// Hide info
function hideInfo() {
    const infoBox = document.getElementById('infoBox');
    if (infoBox) infoBox.style.display = 'none';
}

// Return to ship view
function returnToShipView() {
    const shipPosition = spaceship.position.clone();
    const targetPosition = new THREE.Vector3(
        shipPosition.x,
        shipPosition.y + 5,
        shipPosition.z + 20
    );
    smoothCameraTransition(targetPosition, true);
}

// Smooth camera transition
function smoothCameraTransition(targetPosition, isReturnToShip = false) {
    const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    let end;

    if (isReturnToShip) {
        end = { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z };
    } else {
        end = { x: targetPosition.x, y: targetPosition.y + 20, z: targetPosition.z + 40 };  // Adjusted for larger objects
    }

    let progress = 0;

    function animateTransition() {
        if (progress >= 1) return;
        progress += 0.02;
        camera.position.set(
            start.x + (end.x - start.x) * progress,
            start.y + (end.y - start.y) * progress,
            start.z + (end.z - start.z) * progress
        );
        camera.lookAt(isReturnToShip ? spaceship.position : targetPosition);
        requestAnimationFrame(animateTransition);
    }
    animateTransition();
}

// Create trail particles - IMPROVED FOR BETTER FADE
function createTrailParticles() {
    const particleCount = 2000;  // Increased for longer trail
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);  // Added for custom opacity control

    const color = new THREE.Color(0x88aaff);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = 0;
        opacities[i] = 0;  // Initialize opacity
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));  // Add opacity attribute

    const material = new THREE.PointsMaterial({
        size: 1.0,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    // Custom shader material to handle particle opacity
    material.onBeforeCompile = function(shader) {
        shader.vertexShader = shader.vertexShader.replace(
            'attribute vec3 position;',
            'attribute vec3 position; attribute float opacity;'
        );
        
        shader.vertexShader = shader.vertexShader.replace(
            'varying vec3 vColor;',
            'varying vec3 vColor; varying float vOpacity;'
        );
        
        shader.vertexShader = shader.vertexShader.replace(
            'vColor = color;',
            'vColor = color; vOpacity = opacity;'
        );
        
        shader.fragmentShader = shader.fragmentShader.replace(
            'varying vec3 vColor;',
            'varying vec3 vColor; varying float vOpacity;'
        );
        
        shader.fragmentShader = shader.fragmentShader.replace(
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a * vOpacity );'
        );
    };

    return new THREE.Points(geometry, material);
}

// Update trail particles - IMPROVED FOR BETTER FADE
function updateTrailParticles() {
    if (!spaceship || !trailParticles) return;

    const positions = trailParticles.geometry.attributes.position.array;
    const sizes = trailParticles.geometry.attributes.size.array;
    const colors = trailParticles.geometry.attributes.color.array;
    const opacities = trailParticles.geometry.attributes.opacity.array;  // Added for opacity control

    // Shift all particles one position back
    for (let i = positions.length / 3 - 1; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];

        // Make trail fade faster
        sizes[i] = sizes[i - 1] * 0.98;
        
        // Progressive opacity reduction for better fade effect
        opacities[i] = opacities[i - 1] * 0.98;
        
        // Apply color fade to blue-white
        if (i % 5 === 0) {  // Apply color changes more gradually
            colors[i * 3] = colors[(i - 1) * 3] + 0.002;  // Increase red component
            colors[i * 3 + 1] = colors[(i - 1) * 3 + 1] + 0.002;  // Increase green component
            // Blue stays the same to maintain blue tint
        }
    }

    // Add new particle at the engine position
    if (isMoving()) {
        // Position behind the engines
        const enginePosition = new THREE.Vector3(-4.5, 0, 0);
        enginePosition.applyMatrix4(spaceship.matrixWorld);

        positions[0] = enginePosition.x;
        positions[1] = enginePosition.y;
        positions[2] = enginePosition.z;

        // Random size for sparkle effect
        sizes[0] = Math.random() * 3 + 2;
        
        // Full opacity for new particles
        opacities[0] = 1.0;

        // Brighter color for better visibility
        const colorBase = new THREE.Color(0x88bbff);
        const hueShift = (Math.random() - 0.5) * 0.2;
        colorBase.offsetHSL(hueShift, 0, 0);

        colors[0] = colorBase.r;
        colors[1] = colorBase.g;
        colors[2] = colorBase.b;
    } else {
        // No movement, no new particles
        sizes[0] = 0;
        opacities[0] = 0;
    }

    trailParticles.geometry.attributes.position.needsUpdate = true;
    trailParticles.geometry.attributes.size.needsUpdate = true;
    trailParticles.geometry.attributes.color.needsUpdate = true;
    trailParticles.geometry.attributes.opacity.needsUpdate = true;
}

// Check if spaceship is moving
function isMoving() {
    return keys.w || keys.s || keys.a || keys.d;
}

// IMPROVED SPACESHIP ORIENTATION - Make it face direction of movement
function updateShipDirection() {
    if (!spaceship) return;
    
    // Calculate movement direction vector
    const movementVector = new THREE.Vector3(0, 0, 0);
    
    if (keys.w) movementVector.z -= 1;
    if (keys.s) movementVector.z += 1;
    if (keys.a) movementVector.x -= 1;
    if (keys.d) movementVector.x += 1;
    
    // Only update direction if the ship is actually moving
    if (movementVector.length() > 0) {
        // Normalize the vector
        movementVector.normalize();
        
        // Calculate target rotation to face movement direction
        // Since the ship's "forward" is along the positive X-axis
        const targetRotation = Math.atan2(movementVector.x, movementVector.z);
        
        // Smoothly rotate to face movement direction
        spaceship.rotation.y = targetRotation;
        
        // Add banking effect when turning (roll)
        if (keys.a) {
            spaceship.rotation.z = Math.lerp(spaceship.rotation.z, 0.2, 0.1);
        } else if (keys.d) {
            spaceship.rotation.z = Math.lerp(spaceship.rotation.z, -0.2, 0.1);
        } else {
            spaceship.rotation.z = Math.lerp(spaceship.rotation.z, 0, 0.1);
        }
        
        // Add pitch effect
        if (keys.w) {
            spaceship.rotation.x = Math.lerp(spaceship.rotation.x, -0.05, 0.1);
        } else if (keys.s) {
            spaceship.rotation.x = Math.lerp(spaceship.rotation.x, 0.05, 0.1);
        } else {
            spaceship.rotation.x = Math.lerp(spaceship.rotation.x, 0, 0.1);
        }
    } else {
        // If not moving, gradually return to neutral orientation
        spaceship.rotation.z = Math.lerp(spaceship.rotation.z, 0, 0.05);
        spaceship.rotation.x = Math.lerp(spaceship.rotation.x, 0, 0.05);
    }
}

// Helper function for smooth lerp (since THREE.Math.lerp might not be available)
Math.lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
};

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Orbit planets around the sun
    planets.forEach((planet) => {
        // Rotate planet on its axis
        planet.mesh.rotation.y += 0.003;
        
        // Orbit planet around the sun
        planet.orbit.rotation.y += planet.orbitalSpeed;
    });

    // Rotate sun on its axis
    sun.rotation.y += 0.001;

    // Orbit the sun system around the black hole
    sunSystem.rotation.y += 0.0001;  // Very slow orbit for the entire sun system

    // Rotate accretion disk
    accretionDisk.rotation.z += 0.002;

    if (spaceship) {
        const moveSpeed = 0.8;  // Increased for better navigation of larger space
        
        // Calculate acceleration based on key presses
        const acceleration = 0.05;
        const deceleration = 0.02;
        
        if (keys.w) spaceshipVelocity.z -= acceleration;
        else if (keys.s) spaceshipVelocity.z += acceleration;
        else {
            // Apply deceleration when no forward/backward keys are pressed
            if (Math.abs(spaceshipVelocity.z) < deceleration) {
                spaceshipVelocity.z = 0;
            } else {
                spaceshipVelocity.z -= Math.sign(spaceshipVelocity.z) * deceleration;
            }
        }
        
        if (keys.a) spaceshipVelocity.x -= acceleration;
        else if (keys.d) spaceshipVelocity.x += acceleration;
        else {
            // Apply deceleration when no left/right keys are pressed
            if (Math.abs(spaceshipVelocity.x) < deceleration) {
                spaceshipVelocity.x = 0;
            } else {
                spaceshipVelocity.x -= Math.sign(spaceshipVelocity.x) * deceleration;
            }
        }
        
        // Apply maximum velocity limits
        const maxVelocity = moveSpeed;
        spaceshipVelocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, spaceshipVelocity.x));
        spaceshipVelocity.z = Math.max(-maxVelocity, Math.min(maxVelocity, spaceshipVelocity.z));
        
        // Apply velocity to position
        spaceship.position.x += spaceshipVelocity.x;
        spaceship.position.z += spaceshipVelocity.z;

        // Add a slight hover animation to the spaceship
        spaceship.position.y = Math.sin(Date.now() * 0.001) * 0.2;

        // Update ship orientation to face direction of movement
        updateShipDirection();

        // Update trail particles
        updateTrailParticles();

        checkPlanetProximity();
    }

    // Light glow effects for data planets
    planets.forEach(planet => {
        if (planet.hasData) {
            // Find the glow in the planet's orbit group
            const planetWorldPos = new THREE.Vector3();
            planet.mesh.getWorldPosition(planetWorldPos);
            
            const glow = planet.orbit.children.find(child =>
                child.isMesh &&
                child.material.transparent &&
                child.position.equals(planet.mesh.position) &&
                child !== planet.mesh
            );

            if (glow) {
                glow.material.opacity = 0.2 + Math.sin(Date.now() * 0.001) * 0.1;
            }
        }
    });

    // Animate sun glow
    if (sunGlow) {
        sunGlow.scale.set(
            1 + Math.sin(Date.now() * 0.0005) * 0.05,
            1 + Math.sin(Date.now() * 0.0005) * 0.05,
            1 + Math.sin(Date.now() * 0.0005) * 0.05
        );
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


function createSpaceshipFromPhoto(scene) {
    // Create a group to hold all spaceship parts
    const spaceship = new THREE.Group();

    // Main body - fuselage with sharper edges
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 6, 8); // Using cylinder for sharper edges
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd, // Lighter color to make it more visible
        metalness: 0.9,
        roughness: 0.1, // Lower roughness for sharper appearance
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2; // Rotate to make it horizontal
    spaceship.add(body);

    // Cockpit - glass dome with sharper facets
    const cockpitGeometry = new THREE.SphereGeometry(1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2); // Lower segment count for sharper facets
    const cockpitMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc4e0ff,
        metalness: 0.2,
        roughness: 0.05, // Lower roughness for sharper appearance
        transparent: true,
        opacity: 0.8,
        transmission: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(2.5, 0, 0);
    cockpit.rotation.z = -Math.PI / 2;
    spaceship.add(cockpit);

    // Create X-wing style wings with sharper edges
    const wingGeometry = new THREE.BoxGeometry(5, 0.15, 1.2); // Thinner for sharper look
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.9,
        roughness: 0.1 // Lower roughness for sharper appearance
    });


    // Top left wing
    const topLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    topLeftWing.position.set(-1, 1.3, 2);
    topLeftWing.rotation.z = Math.PI * 0.08;
    spaceship.add(topLeftWing);

    // Bottom left wing
    const bottomLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    bottomLeftWing.position.set(-1, -1.3, 2);
    bottomLeftWing.rotation.z = -Math.PI * 0.08;
    spaceship.add(bottomLeftWing);

    // Top right wing
    const topRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    topRightWing.position.set(-1, 1.3, -2);
    topRightWing.rotation.z = Math.PI * 0.08;
    spaceship.add(topRightWing);

    // Bottom right wing
    const bottomRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    bottomRightWing.position.set(-1, -1.3, -2);
    bottomRightWing.rotation.z = -Math.PI * 0.08;
    spaceship.add(bottomRightWing);

    // Add engine details on each wing with sharper edges
    const engineGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8); // Fewer segments for sharper look
    const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222, // Darker for contrast
        metalness: 1.0,
        roughness: 0.1 // Lower roughness for sharper appearance
    });

    const enginePositions = [
        new THREE.Vector3(-3, 1.3, 2),
        new THREE.Vector3(-3, -1.3, 2),
        new THREE.Vector3(-3, 1.3, -2),
        new THREE.Vector3(-3, -1.3, -2)
    ];

    enginePositions.forEach(pos => {
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.copy(pos);
        engine.rotation.z = Math.PI / 2;
        spaceship.add(engine);

        // Add engine glow with higher intensity
        const engineGlowGeometry = new THREE.CircleGeometry(0.4, 8); // Fewer segments for sharper look
        const engineGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x66aaff,
            transparent: true,
            opacity: 0.9, // Higher opacity for visibility
            side: THREE.DoubleSide
        });
        const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
        engineGlow.position.set(pos.x - 0.8, pos.y, pos.z);
        engineGlow.rotation.y = Math.PI / 2;
        spaceship.add(engineGlow);
    });

    // Add orange accents/details with higher contrast
    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xff5500, // More vibrant orange
        emissive: 0xff3300,
        emissiveIntensity: 0.5, // Increased for visibility
        metalness: 0.8,
        roughness: 0.1 // Lower roughness for sharper appearance
    });

    // Add stripe details to wings
    const stripeGeometry = new THREE.BoxGeometry(1, 0.05, 1.2);

    const wingStripePositions = [
        { pos: new THREE.Vector3(-2, 1.3, 2), wing: topLeftWing },
        { pos: new THREE.Vector3(-2, -1.3, 2), wing: bottomLeftWing },
        { pos: new THREE.Vector3(-2, 1.3, -2), wing: topRightWing },
        { pos: new THREE.Vector3(-2, -1.3, -2), wing: bottomRightWing }
    ];

    wingStripePositions.forEach(item => {
        const stripe = new THREE.Mesh(stripeGeometry, accentMaterial);
        stripe.position.copy(item.pos);
        stripe.rotation.copy(item.wing.rotation);
        spaceship.add(stripe);
    });

    // Add details to body with sharper edges
    const bodyAccentGeometry = new THREE.BoxGeometry(0.5, 0.5, 3); // Box for sharp edges
    const bodyAccent = new THREE.Mesh(bodyAccentGeometry, accentMaterial);
    bodyAccent.position.set(0, -0.8, 0);
    spaceship.add(bodyAccent);

    // Add sharper antenna details
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 4); // Fewer segments for sharper look
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.9,
        roughness: 0.1
    });

    const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna1.position.set(2, 0.8, 0);
    antenna1.rotation.x = Math.PI / 2;
    spaceship.add(antenna1);

    const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna2.position.set(-2, 0.8, 0);
    antenna2.rotation.x = Math.PI / 2;
    spaceship.add(antenna2);

    // Add front cannons with sharper edges
    const cannonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 6); // Fewer segments for sharper look
    const cannonMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111, // Darker for contrast
        metalness: 1.0,
        roughness: 0.05 // Lower roughness for sharper appearance
    });

    const cannonPositions = [
        new THREE.Vector3(3.5, 0.5, 0.8),
        new THREE.Vector3(3.5, 0.5, -0.8),
        new THREE.Vector3(3.5, -0.5, 0.8),
        new THREE.Vector3(3.5, -0.5, -0.8)
    ];

    cannonPositions.forEach(pos => {
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.position.copy(pos);
        cannon.rotation.z = Math.PI / 2;
        spaceship.add(cannon);
    });

    // Add edge highlights for more definition
    const highlightMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });

    const bodyEdgesGeometry = new THREE.EdgesGeometry(bodyGeometry);
    const bodyEdges = new THREE.LineSegments(bodyEdgesGeometry, highlightMaterial);
    bodyEdges.rotation.z = Math.PI / 2;
    spaceship.add(bodyEdges);

    // Center the spaceship
    spaceship.position.set(0, 0, 0);
    spaceship.castShadow = true;
    spaceship.receiveShadow = true;

    return spaceship;
}


function updateShipOrientation() {
    if (!spaceship) return;

    // Current rotation values
    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetRotationZ = 0;

    // Calculate target rotation based on movement keys
    if (keys.a) targetRotationY = 0.3; // Turn left
    if (keys.d) targetRotationY = -0.3; // Turn right
    if (keys.w) targetRotationX = 0.1; // Nose down slightly when moving forward
    if (keys.s) targetRotationX = -0.1; // Nose up slightly when moving backward

    // Calculate roll (z-axis rotation) when turning
    if (keys.a) targetRotationZ = 0.2; // Bank left
    if (keys.d) targetRotationZ = -0.2; // Bank right

    // Smoothly interpolate current rotation to target rotation
    spaceship.rotation.y += (targetRotationY - spaceship.rotation.y) * 0.1;
    spaceship.rotation.x += (targetRotationX - spaceship.rotation.x) * 0.1;
    spaceship.rotation.z += (targetRotationZ - spaceship.rotation.z) * 0.1;

    // If not moving, gradually return to neutral position
    if (!keys.a && !keys.d && !keys.w && !keys.s) {
        spaceship.rotation.x *= 0.95;
        spaceship.rotation.y *= 0.95;
        spaceship.rotation.z *= 0.95;
    }
}