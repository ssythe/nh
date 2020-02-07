/*

    Chooses a random spawn based on either the size of the baseplate, or if any spawnbricks are present
    it will choose a random spawn point.

*/

const Game = require("../../class/game").default

const Vector3 = require("../../class/vector3").default

function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min))
}

function pickSpawn() {
    const SPAWN_LENGTH = Game.world.spawns.length

    if (SPAWN_LENGTH > 0) {
        const SPAWN_BRICK = Game.world.spawns[Math.floor(Math.random() * SPAWN_LENGTH)]
        return new Vector3(
            SPAWN_BRICK.position.x + SPAWN_BRICK.scale.x/2,
            SPAWN_BRICK.position.y + SPAWN_BRICK.scale.y/2,
            SPAWN_BRICK.position.z + SPAWN_BRICK.scale.z/2
        )
    }

    const BASE_SIZE = Game.world.environment.baseSize

    return new Vector3(
        generateRandomInteger(-BASE_SIZE/2, BASE_SIZE/2),
        generateRandomInteger(-BASE_SIZE/2, BASE_SIZE/2),
        BASE_SIZE/2
    )
}

module.exports = pickSpawn