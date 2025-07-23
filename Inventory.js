class Inventory {
    constructor() {
        this.weapons = [];
        this.currentWeaponIndex = -1;
    }

    addWeapon(weapon) {
        this.weapons.push(weapon);
        if (this.currentWeaponIndex === -1) {
            this.currentWeaponIndex = 0;
        }
    }

    removeWeapon(weaponName) {
        this.weapons = this.weapons.filter(weapon => weapon.name !== weaponName);
        if (this.weapons.length === 0) {
            this.currentWeaponIndex = -1;
        } else if (this.currentWeaponIndex >= this.weapons.length) {
            this.currentWeaponIndex = this.weapons.length - 1;
        }
    }

    getCurrentWeapon() {
        if (this.currentWeaponIndex !== -1) {
            return this.weapons[this.currentWeaponIndex];
        }
        return null;
    }

    switchWeapon(direction) {
        if (this.weapons.length > 1) {
            this.currentWeaponIndex += direction;
            if (this.currentWeaponIndex < 0) {
                this.currentWeaponIndex = this.weapons.length - 1;
            } else if (this.currentWeaponIndex >= this.weapons.length) {
                this.currentWeaponIndex = 0;
            }
        }
    }
}
