const PacketBuilder = require("../../net/PacketBuilder").default

const filterModule = require("../../util/filter/filterModule").default

const Game = require("../../class/Game").default

const formatHex = require("../../util/color/formatHex").default

const rateLimit = new Set()

function generateTitle(p, message) {
    let title = `[#ffde0a]${p.username}\\c1:\\c0 ` + message

    if (p.team)
        title = `[${p.team.color}]${p.username}\\c1:\\c0 ` + message
        
    if (p.admin)
        title = `[#ffde0a]${p.username}\\c1:\\c0 ` + '[#ffde0a]' + message

    if (p.chatColor)
        title = `[${p.chatColor}]${p.username}\\c1:\\c0 ` + message

    title = formatHex(title)

    return title
}

function clientMessageAll(p, message) {
    if (p.muted)
        return p.message("You are muted.")

    if (rateLimit.has(p.userId))
        return p.message("You're chatting too fast!")

    if (message.length > 85)
        message = message.substring(0, 85) + "..."

    rateLimit.add(p.userId)
    setTimeout(() => rateLimit.delete(p.userId), 2000)

    const title = generateTitle(p, message)

    if (filterModule.isSwear(message))
        return p.message("Don't swear! Your message has not been sent.")

    console.log(`${p.username}: ${message}`)

    Game.emit("chatted", p, message)

    p.emit("chatted", message)

    // Stop execution, the host has a Game.on("chat") script
    // They want to modify the chat.
    if (Game.listeners("chat").length)
        return Game.emit("chat", p, message)

    return new PacketBuilder("Chat")
        .write("string", title)
        .broadcastExcept(p.getBlockedPlayers())
}

function messageAll(message) {
    message = formatHex(message)

    return new PacketBuilder("Chat")
        .write("string", message)
        .broadcast()
}

function messageClient(socket, message) {
    message = formatHex(message)

    return new PacketBuilder("Chat")
        .write("string", message)
        .send(socket)
}

module.exports = { messageAll, messageClient, clientMessageAll }