const PacketBuilder = require("../../net/PacketBuilder").default

const { hexToDec } = require("../../util/color/colorModule").default

const formatHex = require("../../util/color/formatHex").default

function createBotIdBuffer(bot, idString = "") {
    const length = idString.length

    const botPacket = new PacketBuilder("Bot")
            .write("uint32", bot.netId)
            .write("string", idString)

    for (let i = 0; i < length; i++) {
        const ID = idString.charAt(i)
        switch (ID) {
            case "B": {
                botPacket.write("float", bot.position.x)
                break
            }
            case "C": {
                botPacket.write("float", bot.position.y)
                break
            }
            case "D": {
                botPacket.write("float", bot.position.z)
                break
            }
            case "E": {
                botPacket.write("float", bot.rotation.x)
                break
            }
            case "F": {
                botPacket.write("float", bot.rotation.y)
                break
            }
            case "G": {
                botPacket.write("float", bot.rotation.z)
                break
            }
            case "H": {
                botPacket.write("float", bot.scale.x)
                break
            }
            case "I": {
                botPacket.write("float", bot.scale.y)
                break
            }
            case "J": {
                botPacket.write("float", bot.scale.z)
                break
            }
            case "K": {
                botPacket.write("uint32", hexToDec(bot.colors.head))
                break
            }
            case "L": {
                botPacket.write("uint32", hexToDec(bot.colors.torso))
                break
            }
            case "M": {
                botPacket.write("uint32", hexToDec(bot.colors.leftArm))
                break
            }
            case "N": {
                botPacket.write("uint32", hexToDec(bot.colors.rightArm ))
                break
            }
            case "O": {
                botPacket.write("uint32", hexToDec(bot.colors.leftLeg))
                break
            }
            case "P": {
                botPacket.write("uint32", hexToDec(bot.colors.rightLeg))
                break
            }
            case "Q": {
                botPacket.write("uint32", bot.assets.face)
                break
            }
            case "U": {
                botPacket.write("uint32", bot.assets.hat1)
                break
            }
            case "V": {
                botPacket.write("uint32", bot.assets.hat2)
                break
            }
            case "W": {
                botPacket.write("uint32", bot.assets.hat3)
                break
            }
            case "X": {
                botPacket.write("string", formatHex(bot.speech))
                break
            }
            case "R": {
                botPacket.write("uint32", bot.assets.shirt)
                break
            }
            case "S": {
                botPacket.write("uint32", bot.assets.pants)
                break
            }
            case "T": {
                botPacket.write("uint32", bot.assets.tshirt)
                break
            }
        }
    }
    
    return botPacket.broadcast()
}

module.exports = createBotIdBuffer