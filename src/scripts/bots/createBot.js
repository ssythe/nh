const PacketBuilder = require("../../util/net/packetBuilder").default

const { hexToDec } = require("../../util/color/colorModule")

function botPacket(bot) {
    const botBuffer = new PacketBuilder("Bot")
        .write("uint32", bot.netId)
        .write("string", "ABCDEFGHIJKLMNOPQUVWX")
        .write("string", bot.name)

        // Position
        .write("float", bot.position.x)
        .write("float", bot.position.y)
        .write("float", bot.position.z)

        // Rotation
        .write("uint32", bot.rotation.x)
        .write("uint32", bot.rotation.y)
        .write("uint32", bot.rotation.z)

        // Scale
        .write("float", bot.scale.x)
        .write("float", bot.scale.y)
        .write("float", bot.scale.z)

        // Part Colors
        .write("uint32", hexToDec(bot.colors.head))
        .write("uint32", hexToDec(bot.colors.torso))
        .write("uint32", hexToDec(bot.colors.leftArm))
        .write("uint32", hexToDec(bot.colors.rightArm))
        .write("uint32", hexToDec(bot.colors.leftLeg))
        .write("uint32", hexToDec(bot.colors.rightLeg))

        // Clothing
        .write("uint32", bot.assets.face)

        // Hats
        .write("uint32", bot.assets.hat1)
        .write("uint32", bot.assets.hat2)
        .write("uint32", bot.assets.hat3)

        // Speech
        .write("string", bot.speech)
        
    return botBuffer
}

module.exports = botPacket