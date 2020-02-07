const PacketBuilder = require("../../util/net/packetBuilder").default

function createToolPacket(tool, destroy = false) {
    const packet = new PacketBuilder("Tool")
        .write("bool", destroy)
        .write("uint32", tool._slotId)
        .write("string", tool.name)
        .write("uint32", tool.model)
    return packet
}

module.exports = createToolPacket