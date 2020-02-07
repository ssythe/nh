const PacketBuilder = require("../../util/net/packetBuilder").default

async function kick(socket, message = "No reason given.") {
   await new PacketBuilder("PlayerModification")
        .write("string", "kick")
        .write("string", "[You were kicked]\n\nReason: " + message)
        .send(socket)

    socket.destroy()
}

module.exports = kick