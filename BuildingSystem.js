class BuildingSystem {
    constructor(scene) {
        this.scene = scene;
        this.buildables = [];
        this.currentBuildableIndex = 0;
        this.previewMesh = null;

        this.buildables.push(new Buildable('Wall', 100));
        this.buildables.push(new Buildable('Ramp', 100));
        this.buildables.push(new Buildable('Floor', 100));

        this.createPreview();
    }

    createPreview() {
        const geometry = this.getBuildableGeometry(this.getCurrentBuildable().name);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
        this.previewMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.previewMesh);
    }

    updatePreview(position, rotation) {
        this.previewMesh.position.copy(position);
        this.previewMesh.rotation.copy(rotation);
    }

    placeBuildable() {
        const buildable = this.getCurrentBuildable();
        const geometry = this.getBuildableGeometry(buildable.name);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const newMesh = new THREE.Mesh(geometry, material);
        newMesh.position.copy(this.previewMesh.position);
        newMesh.rotation.copy(this.previewMesh.rotation);
        this.scene.add(newMesh);
    }

    getCurrentBuildable() {
        return this.buildables[this.currentBuildableIndex];
    }

    switchBuildable() {
        this.currentBuildableIndex++;
        if (this.currentBuildableIndex >= this.buildables.length) {
            this.currentBuildableIndex = 0;
        }
        this.scene.remove(this.previewMesh);
        this.createPreview();
    }

    getBuildableGeometry(buildableName) {
        switch (buildableName) {
            case 'Wall':
                return new THREE.BoxGeometry(5, 5, 0.5);
            case 'Ramp':
                const shape = new THREE.Shape();
                shape.moveTo(0, 0);
                shape.lineTo(5, 0);
                shape.lineTo(5, 5);
                const extrudeSettings = {
                    steps: 2,
                    depth: 5,
                    bevelEnabled: false,
                };
                return new THREE.ExtrudeGeometry(shape, extrudeSettings);
            case 'Floor':
                return new THREE.BoxGeometry(5, 0.5, 5);
        }
    }
}
