function chooseTeamSpawn(p) {
    // This is going to run everytime the player respawns, we need to be sure they have a team.
    if (p.team) {
        const spawns = Game.world.spawns.filter(brick => brick.color === p.team.color)
        if (!spawns.length) return

        const spawn = spawns[Math.floor(Math.random() * spawns.length)]

        return new Vector3(
            spawn.position.x + spawn.scale.x/2, 
            spawn.position.y + spawn.scale.y/2, 
            spawn.scale.z
        )
    }
}

world.spawns.forEach((spawn) => {
    spawn.touching((p) => {
        let team = world.teams.find(t => t.color === spawn.color)
        if (team && p.team !== team) {
            return p.setTeam(team)
        }
    })
})

Game.on("playerJoin", (p) => {
    p.spawnHandler = chooseTeamSpawn
})