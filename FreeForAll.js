class FreeForAll extends GameMode {
    constructor() {
        super('Free For All');
    }

    onPlayerSpawn(player) {
        player.health = 100;
        player.position.set(Math.random() * 100 - 50, 10, Math.random() * 100 - 50);
    }

    onPlayerDeath(player, killer) {
        if (killer) {
            killer.kills++;
        }
        player.deaths++;
        this.onPlayerSpawn(player);
    }
}
