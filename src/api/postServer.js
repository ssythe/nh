/*
    Hey, you found this module. That's cool. See that API down there?

    Yeah, that's not so cool, but if you modify this code to post a 
    
    high player count, your account is going to get terminated.

    So, please keep this between us. Thanks, love you xoxo. 
    
    ~ Jake.
*/

const Game = require("../class/game").default

const phin = require("phin")
    .defaults({
        url: "https://www.brick-hill.com/API/games/postServer",
        method: "POST",
        timeout: 12000 
    })

async function postServer() {
    try {
        if (Game.playerCount < 0)
            return console.warn("Attempted to post negative player count, screenshot this message and send it to Dragonian ASAP.")

        let data = await phin({
            form: {
                "set": Game.gameId,
                "port": Game.port,
                "players": Game.playerCount
            }
        })
        try {
            let body = JSON.parse(data.body)
            if (body.error) {
                console.warn("Failure while posting to games page:", JSON.stringify(body))
                return process.exit(0)
            }
        } catch (err) {} // It was successful (?)
    } catch (err) {
        console.warn("Error while posting to games page.")
        console.error(err.stack)
    }
}

module.exports = postServer
