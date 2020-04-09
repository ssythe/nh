const zlib = require("zlib")

const Brick = require("../../class/Brick").default

const Vector3 = require("../../class/Vector3").default

function serialize(bricks) {
    let binaryData = []

    bricks.forEach((brick) => {
        let data = {}

        if (!brick.position.equalsVector(new Vector3()))
            data.position = [ brick.position.x, brick.position.y, brick.position.z ]

        if (!brick.scale.equalsVector(new Vector3(1, 1, 1)))
            data.scale = [ brick.scale.x, brick.scale.y, brick.scale.z ]
        
        if (brick.color !== "#C0C0C0")
            data.color = brick.color
        
        if (!brick.visibility)
            data.visibility = 0

        if (!brick.collision)
            data.collision = false

        if (brick.name)
            data.name = brick.name

        if (brick.rotation)
            data.rotation = brick.rotation

        if (brick.model)
            data.model = brick.model

        if (brick.lightEnabled) {
            data.lightEnabled = true
            data.lightColor = brick.lightColor
            data.lightrange = brick.lightRange
        }

        if (brick.clickable) {
            data.clickable = true
            data.clickDistance = brick.clickDistance
        }

        binaryData.push(data)
    })

    binaryData = JSON.stringify(binaryData)

    binaryData = zlib.deflateSync(binaryData)

    return binaryData
}

function deserialize(data) {
    data = zlib.inflateSync(data)

    data = JSON.parse(data.toString("ascii"))

    let bricks = []

    data.forEach((brick) => {
        let newBrick = new Brick(brick.position, brick.scale, brick.color)

        Object.keys(brick).forEach((prop) => {
            // Convert objects into Vector3s
            if (typeof brick[prop] === "object") {
                brick[prop] = new Vector3(...brick[prop])
            }
            newBrick[prop] = brick[prop]
        })

        bricks.push(newBrick)
    })

    return bricks
}

module.exports = { serialize, deserialize }