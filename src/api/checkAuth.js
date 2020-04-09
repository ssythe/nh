const phin = require("phin")
    .defaults({"parse": "json", "timeout": 12000})

const Game = require("../class/Game").default

const AUTHENTICATION_API = (token, gameId) => `https://api.brick-hill.com/v1/auth/verifyToken?token=${token}&set=${gameId}`

// For local servers
let playerId = 0

async function checkAuth(socket, reader) {
        // Don't use any of this, it needs to be verified.
        const USER = {
            token: reader.readStringNT(),
            version: reader.readStringNT()
        }

        // Version check
        if (USER.version !== "0.3.0.2")
            return [false, "Your client is out of date."]

        console.log(`<Client: ${socket.IP}> Attempting authentication.`)

        if (Game.local) {
            playerId++
            return [{
                username: "Player" + playerId,
                userId: playerId,
                admin: false,
                membershipType: 1
            }]
        }

        try {
            const data = (await phin({url: AUTHENTICATION_API(USER.token, Game.gameId)})).body
            if (!data.error) {
                return [{
                    username: data.user.username,
                    userId: Number(data.user.id),
                    admin: data.user.is_admin,
                    // screw you jefemy
                    membershipType: (data.user.membership && data.user.membership.membership ) || 1
                }]
            }
        } catch (err) {
            console.warn(`<Error while authenticating: ${socket.IP}>`, err.message)
            return [ false, "Server error while authenticating." ]
        }

        return [ false, "Invalid authentication token provided." ]
}

module.exports = checkAuth