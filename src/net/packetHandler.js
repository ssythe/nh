// Dependencies
let SmartBuffer = require('smart-buffer').SmartBuffer

let zlib = require("zlib")

// Import utilities
let uintv = require("../util/net/uintv")

// Game objects
let Game = require("../class/game").default

let Player = require("../class/player").default

let scripts = require("../scripts")

let { whiteListedKey } = require("../util/keys/whitelisted")

let checkAuth = require("../api/checkAuth")

async function packetHandler(socket, packet) {
    const IP = socket.IP

    // Remove size prefix from the message.
    const BYTE_SIZE = uintv.readUIntv(packet)
    packet = packet.slice(BYTE_SIZE.end)

    try {
        packet = zlib.inflateSync(packet)
    } catch (err) {
        // Packet isn't always compressed.   
    }

    // Create a smart buffer.
    const READER = SmartBuffer.fromBuffer(packet)

    // Get type of packet.
    let TYPE = undefined

    try {
        TYPE = READER.readUInt8()
    } catch (err) {
        return false
    }

    let player = socket.player

    if (TYPE === 1 && player)  return // You can't authenticate more than once.
    if (TYPE !== 1 && !player) return // You don't have a player.

    switch (TYPE) {
        case 1: { // Authentication
            const [ USER, ERR ] = await checkAuth(socket, READER)

            // User could not authenticate properly.
            if (!USER || ERR) {
                console.log(`<Client: ${IP}> Failed verification.`)
                return scripts.kick(socket, ERR || "Server error.")
            }

            const newPlayer = new Player(socket)

            // Make properties readonly.
            Object.defineProperties(newPlayer, {
                userId: { value: USER.userId },
                username: { value: USER.username },
                admin: { value: USER.admin },
                membershipType: { value: USER.membershipType },
            })

            console.log(`Successfully verified! (Username: ${newPlayer.username} | ID: ${newPlayer.userId} | Admin: ${newPlayer.admin})`)
            
            Game._newPlayer(newPlayer)
            
            break
        }
        case 2: { // Update player position
            let xpos,
                ypos,
                zpos,
                zrot;
            try {
                xpos = READER.readFloatLE()
                ypos = READER.readFloatLE()
                zpos = READER.readFloatLE()
                zrot = READER.readUInt32LE()
            } catch (err) {
                return false // Drop the packet
            }
            player._updatePositionForOthers([
                xpos, ypos, zpos, zrot
            ])
            break
        }
        case 3: { // Commands
            let command, args;

            try {
                command = READER.readStringNT()
                args = READER.readStringNT()
            } catch (err) {
                return false
            }

            if (command !== "chat")
                return Game.emit("command", command, player, args)

            scripts.message.clientMessageAll(player, args)   
             
            break
        }
        case 4: { // Projectiles
            break
        }
        case 5: { // Clickables
            try {
                let brickId = READER.readUInt32LE()

                let brick = Game.world.bricks.find(brick => brick.netId === brickId)

                if (brick && brick.clickable)
                    return brick.emit("clicked", player)

                // The brick might be local.
                for (let player of Game.players) {
                    let localBricks = player.localBricks
                    if (!localBricks.length) continue

                    let localBrick = localBricks.find(brick => brick.netId === brickId)
                    if (localBrick && localBrick.clickable) {
                        // In case someone calls multiple player.newBrick with the same brick.
                        if (localBrick.socket === player.socket)
                            return localBrick.emit("clicked", player)
                    }
                }
            } catch (err) {
                return false
            }
            break
        }
        case 6: { // Player input 
            try {
                let click = Boolean(READER.readUInt8())
                let key = READER.readStringNT()

                if (click) player.emit("mouseclick")

                if (key && whiteListedKey.includes(key))
                    player.emit("keypress", key)
            } catch (err) {
                return false
            }
            break
        }
    }
}

module.exports = { packetHandler }