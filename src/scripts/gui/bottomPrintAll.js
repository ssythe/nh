const PacketBuilder = require("../../util/net/packetBuilder").default

const formatHex = require("../../util/color/formatHex")

function bottomPrintAll(message = "", seconds = 1) {
    message = formatHex(message)
    return new PacketBuilder("PlayerModification")
        .write("string", "bottomPrint")
        .write("string", message)
        .write("uint32", seconds)
        .broadcast()
}

module.exports = bottomPrintAll