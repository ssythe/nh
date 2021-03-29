const { hexToDec } = require("../../util/color/colorModule").default

function addBrickProperties(packet, brick) {
    packet.write("uint32", brick.netId)
    packet.write("float", brick.position.x)
    packet.write("float", brick.position.y)
    packet.write("float", brick.position.z)
    packet.write("float", brick.scale.x)
    packet.write("float", brick.scale.y)
    packet.write("float", brick.scale.z)
    packet.write("uint32", hexToDec(brick.color))
    packet.write("float", brick.visibility)
    // Additional attributes
    let attributes = ""
    if (brick.rotation)
        attributes += "A"

    if (brick.shape)
        attributes += "B"

    if (brick.model)
        attributes += "C"

    if (brick.lightEnabled)
        attributes += "D"

    if (!brick.collision)
        attributes += "F"

    if (brick.clickable)
        attributes += "G"

    packet.write("string", attributes)

    for (let i = 0; i < attributes.length; i++) {
        const ID = attributes.charAt(i)
        switch (ID) {
            case "A":
                packet.write("int32", brick.rotation)
                break;
            case "B":
                packet.write("string", brick.shape)
                break;
            case "C":
                packet.write("uint32", brick.model)
                break;
            case "D":
                packet.write("uint32", hexToDec(brick.lightColor))
                packet.write("uint32", brick.lightRange)
                break;
            case "G":
                packet.write("uint32", brick.clickDistance)
                break;
        }

    }
}

module.exports = addBrickProperties