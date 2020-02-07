const PacketBuilder = require("../../util/net/packetBuilder").default

const formatHex = require("../../util/color/formatHex")

function topPrint(socket, message = "", seconds = 1) {
    message = formatHex(message)
    return new PacketBuilder("PlayerModification")
        .write("string", "topPrint")
        .write("string", message)
        .write("uint32", seconds)
        .send(socket)
}

module.exports = topPrint