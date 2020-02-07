const PacketBuilder = require("../../util/net/packetBuilder").default

function prompt(socket, message) {
    return new PacketBuilder("PlayerModification")
        .write("string", "prompt")
        .write("string", message)
        .send(socket)
}

module.exports = prompt