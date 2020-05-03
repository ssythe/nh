const PacketBuilder = require("../../net/PacketBuilder").default

let { hexToDec } = require("../../util/color/colorModule").default

function createBrickIdBuffer(brick, modification) {
    let brickPacket = new PacketBuilder("Brick")
        .write("uint32", brick.netId)
        .write("string", modification)

    switch (modification) {
        case "pos": {
            brickPacket.write("float", brick.position.x)
            brickPacket.write("float", brick.position.y)
            brickPacket.write("float", brick.position.z)
            break
        }
        case "rot": {
            brickPacket.write("uint32", brick.rotation)
            break
        }
        case "scale": {
            brickPacket.write("float", brick.scale.x)
            brickPacket.write("float", brick.scale.y)
            brickPacket.write("float", brick.scale.z)
            break
        }
        case "kill": {
            break
        }
        case "destroy": {
            break
        }
        case "col": {
            brickPacket.write("uint32", hexToDec(brick.color))
            break
        }
        case "model": {
            brickPacket.write("uint32", brick.model)
            break
        }
        case "alpha": {
            brickPacket.write("float", brick.visibility)
            break
        }
        case "collide": {
            brickPacket.write("bool", brick.collision)
            break
        }
        case "lightcol": {
            brickPacket.write("uint32", hexToDec(brick.lightColor))
            break
        }
        case "lightrange": {
            brickPacket.write("uint32", brick.lightRange)
            break
        }
        case "clickable": {
            brickPacket.write("bool", brick.clickable)
            brickPacket.write("uint32", brick.clickDistance)
            break
        }
    }

    // This is a local brick, send it to the player's attached socket.
    if (brick.socket)
        return brickPacket.send(brick.socket)

    return brickPacket.broadcast()
}

module.exports = createBrickIdBuffer