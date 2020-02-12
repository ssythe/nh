const addBrickProperties = require("./sendBrick")

const PacketBuilder = require("../../util/net/packetBuilder").default

function loadBricks(bricks = []) {
    if (!bricks.length) return

    const packet = new PacketBuilder("SendBrick", { compression: true })

    for (let brick of bricks)
        addBrickProperties(packet, brick)

    return packet
}

module.exports = loadBricks