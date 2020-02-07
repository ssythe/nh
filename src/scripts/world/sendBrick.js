const { hexToRGB } = require("../../util/color/color")

function addBrickProperties(packet, brick) {
    // Create brick header
    let properties = ""
    properties = `${brick.position.x} ${brick.position.y} ${brick.position.z} `
    properties += `${brick.scale.x} ${brick.scale.y} ${brick.scale.z} `
    const rgb = hexToRGB(brick.color)
    properties += `${Math.round(100 * rgb[0] / 255) / 100} `
    properties += `${Math.round(100 * rgb[1] / 255) / 100} `
    properties += `${Math.round(100 * rgb[2] / 255) / 100} `
    properties += `${brick.visibility}`

    packet.write("string", properties + "\r\n")

    packet.write("string", `\t+NAME ${brick.netId}\r\n`)

    if (brick.shape)
        packet.write("string", `\t+SHAPE ${brick.shape}\r\n`)

    if (brick.rotation)
        packet.write("string", `\t+ROT ${brick.rotation}\r\n`)

    if (brick.model)
        packet.write("string", `\t+MODEL ${brick.model}\r\n`)

    if (brick.lightEnabled) {
        let rgb = hexToRGB(brick.lightColor)
        rgb[0] = Math.round(100 * rgb[0] / 255) / 100
        rgb[1] = Math.round(100 * rgb[1] / 255) / 100
        rgb[2] = Math.round(100 * rgb[2] / 255) / 100
        const newRGB = `${rgb[0]} ${rgb[1]} ${rgb[2]}`
        packet.write("string", `\t+LIGHT ${newRGB} ${brick.lightRange}\r\n`)
    }

    if (brick.clickable == true)
        packet.write("string", `\t+CLICKABLE ${brick.clickDistance}\r\n`)

    if (!brick.collision)
        packet.write("string", '\t+NOCOLLISION\r\n')
}
 
module.exports = addBrickProperties