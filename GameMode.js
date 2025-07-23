class GameMode {
    constructor(name) {
        this.name = name;
    }

    onPlayerSpawn(player) {
        // To be implemented by subclasses
    }

    onPlayerDeath(player, killer) {
        // To be implemented by subclasses
    }
}
