// Import dependencies
const net = require("net")

// Import game data
const Game = require("./class/Game").default

// Post server
const postServer = require("./api/postServer")

// Connection + packet handler
const { packetHandler } = require("./net/packetHandler")

// Create socket server.
const SERVER = net.createServer(socketConnection)

function maskIP(ip) {
    ip = ip.split(".").splice(0, 2)
    return ip.join(".") + ".x.x"
}

async function socketConnection(client) {
    client.IPV4 = client.remoteAddress

    client.IP = maskIP(client.IPV4)

    console.log(`<New client: ${client.IP}>`)

    client.setNoDelay(true)

    client.setKeepAlive(true, 10000)

    client.on("data", (PACKET) => {
        packetHandler(client, PACKET)
            .catch(console.error)
    })

    client.once("close", async() => {
        console.log(`<Client: ${client.IP}> Lost connection.`)
        if (client.player) {
            await Game._playerLeft(client.player)
                .catch(console.error)
        }
        if (!client.destroyed)
            client.destroy()
    })

    client.on("error", () => {
        if (!client.destroyed)
            client.destroy()
    })

    // If the player fails to authenticate after 20 seconds.
    setTimeout(() => {
        if (!client.player) client.destroy()
    }, 20000)
}

let SERVER_LISTEN_ADDRESS = "0.0.0.0"

if (Game.local) {
    SERVER_LISTEN_ADDRESS = "127.0.0.1"
    Game.port = 42480
}

SERVER.listen(Game.port, SERVER_LISTEN_ADDRESS, () => {
    console.log(`Listening on port: ${Game.port}.`)
    
    if (Game.local) return console.log("Running server locally.")

    if (Game.serverSettings.postServer) {
        postServer().then(() => {
            console.log(`Posted to: https://www.brick-hill.com/play/${Game.gameId} successfully.`)
            setInterval(postServer, 60000)
        })
    }
})