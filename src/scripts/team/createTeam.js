const PacketBuilder = require("../../net/PacketBuilder").default

const { hexToDec } = require("../../util/color/colorModule")

function createTeamPacket(team) {
    const packet = new PacketBuilder("Team")
        .write("uint32", team.netId)
        .write("string", team.name)
        .write("uint32", hexToDec(team.color))
    return packet
}

module.exports = createTeamPacket