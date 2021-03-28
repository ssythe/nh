const addBrickProperties = require("./sendBrick")

const PacketBuilder = require("../../net/PacketBuilder").default

function loadBricks(bricks = []) {
    if (!bricks.length) return

    const packet = new PacketBuilder("SendBrick", { compression: bricks.length !== 1 })
    packet.write("uint32", bricks.length)

    for (let brick of bricks)
        addBrickProperties(packet, brick, true)

    return packet
}

module.exports = loadBricks