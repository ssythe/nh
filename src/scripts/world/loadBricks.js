const addBrickProperties = require("./sendBrick")

const PacketBuilder = require("../../net/PacketBuilder").default

function loadBricks(bricks = []) {
    if (!bricks.length) return

    const packet = new PacketBuilder("SendBrick", { compression: true })
    packet.write("uint32", bricks.length)

    for (let brick of bricks)
        addBrickProperties(packet, brick)

    return packet
}

module.exports = loadBricks