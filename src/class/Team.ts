import Game from "./Game"

import teamPacket from "../scripts/team/createTeam"

/** This is used for creating teams in Brick Hill. \
 * ![](https://cdn.discordapp.com/attachments/601268924251897856/655573900318474253/unknown.png)
*/
export default class Team {
    readonly name: string

    readonly color: string

    readonly netId: number

    static teamId: number = 0

    constructor(name: string, color = "#ffffff") {
        Team.teamId += 1
        
        this.name = name

        this.color = color

        this.netId = Team.teamId

        Game.world.teams.push(this)

        teamPacket(this).broadcast()
    }
}