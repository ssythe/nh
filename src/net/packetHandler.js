// Dependencies
let SmartBuffer = require("smart-buffer").SmartBuffer

let zlib = require("zlib")

// Import utilities
let uintv = require("./uintv")

// Game objects
let Game = require("../class/Game").default

let Player = require("../class/Player").default

let generateTitle = require("../util/chat/generateTitle").default

let scripts = require("../scripts")

let { whiteListedKey } = require("../util/keys/whitelisted")

let checkAuth = require("../api/checkAuth")

async function packetHandler(socket, packet) {
    const IP = socket.IP

    // Remove size prefix from the message.
    const BYTE_SIZE = uintv.readUIntVByteLength(packet)
    packet = packet.slice(BYTE_SIZE)

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
        /* <Authentication handler> */
        case 1: {
            const [ USER, ERR ] = await checkAuth(socket, READER)

            // User could not authenticate properly.
            if (!USER || ERR) {
                console.log(`<Client: ${IP}> Failed verification.`)
                return scripts.kick(socket, ERR || "Server error.")
            }
    
            // Check if the users socket is still active after authentication.
            if (socket.destroyed) return

            // Check if player is already in game + kick them if so.
            for (let player of Game.players) {
                if (player.userId === USER.userId)
                    return scripts.kick(socket, "You can only join this game once per account.")
            }

            const authUser = new Player(socket)

            // Make properties readonly.
            Object.defineProperties(authUser, {
                userId: { value: USER.userId },
                username: { value: USER.username },
                admin: { value: USER.admin },
                membershipType: { value: USER.membershipType },
                brickplayer: { value: USER.brickplayer }
            })

            console.log(`Successfully verified! (Username: ${authUser.username} | ID: ${authUser.userId} | Admin: ${authUser.admin})`)

            // Finalize the player joining process.
            Game._newPlayer(authUser)
            
            break
        }
        /* <Player position handler> */
        case 2: {
            let xpos,
                ypos,
                zpos,
                zrot;
            try {
                xpos = READER.readFloatLE()
                ypos = READER.readFloatLE()
                zpos = READER.readFloatLE()
                zrot = READER.readFloatLE()
            } catch (err) {
                return false // Drop the packet
            }
            player._updatePositionForOthers([
                xpos, ypos, zpos, zrot
            ])
            break
        }
        /* <Command handler> */
        case 3: {
            let command, args;

            try {
                command = READER.readStringNT()
                args = READER.readStringNT()
            } catch (err) {
                return false
            }

            if (command !== "chat")
                return Game.emit("command", command, player, args)

            // The host wants to manage chat on their own
            if (Game.listeners("chat").length)
                return Game.emit("chat", player, args, generateTitle(player, args))
            
            player.messageAll(args)
 
            break
        }
        /* <Projectile handler> */
        case 4: {
            break
        }
        /* <Brick click detection handler> */
        case 5: {
            try {
                const brickId = READER.readUInt32LE()

                // Check for global bricks with that Id.
                const brick = Game.world.bricks.find(brick => brick.netId === brickId)
                if (brick && brick.clickable) 
                    return brick.emit("clicked", player)

                // The brick might be local.
                const localBricks = player.localBricks
                const localBrick = localBricks.find(brick => brick.netId === brickId)

                if (localBrick && localBrick.clickable)
                    return localBrick.emit("clicked", player)
            } catch (err) {
                return false
            }
            break
        }
        /* <Player key + mouse input handler> */
        case 6: {
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