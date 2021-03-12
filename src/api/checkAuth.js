const phin = require("phin")
    .defaults({"parse": "json", "timeout": 12000})

const Game = require("../class/Game").default

const AUTHENTICATION_API = (token, gameId) => (
    `https://api.brick-hill.com/v1/auth/verifyToken?token=${encodeURIComponent(token)}&set=${gameId}`
)

const UID_REGEX = /[\w]{8}(-[\w]{4}){3}-[\w]{12}/

// For local servers
let playerId = 0

async function checkAuth(socket, reader) {
        // Don't use any of this, it needs to be verified.
        const USER = {
            token: reader.readStringNT(),
            version: reader.readStringNT(),
            clientId: 0
        }

        // Version check
        if (USER.version !== "0.3.0.3")
            return [ false, "Your client is out of date." ]

        // User might be using Brickplayer
        if (reader.remaining())
            USER.clientId = reader.readUInt8() || 0

        console.log(`<Client: ${socket.IP}> Attempting authentication.`)

        if (Game.local) {
            playerId++
            return [{
                username: "Player" + playerId,
                userId: playerId,
                admin: false,
                membershipType: 1,
                client: USER.clientId
            }]
        }

        // Invalid token format.
        if (!UID_REGEX.test(USER.token)) return

        try {
            const data = (await phin({url: AUTHENTICATION_API(USER.token, Game.gameId)})).body
            if (!data.error) {
                return [{
                    username: data.user.username,
                    userId: Number(data.user.id),
                    admin: data.user.is_admin,
                    // screw you jefemy
                    membershipType: (data.user.membership && data.user.membership.membership ) || 1,
                    client: USER.clientId
                }]
            }
        } catch (err) {
            console.warn(`<Error while authenticating: ${socket.IP}>`, err.message)
            return [ false, "Server error while authenticating." ]
        }

        return [ false, "Invalid authentication token provided." ]
}

module.exports = checkAuth