const phin = require("phin")
    .defaults({ parse: "json", timeout: 12000 })

const API = (assetId) => `https://api.brick-hill.com/v1/shop/owners?id=${assetId}`

async function playerOwnsAsset(userId, assetId) {
    const data = (await phin({url: API(assetId)})).body

    for (let copy of data) {
        if (copy.owner === userId)
            return true
    }

    return false
}

module.exports = playerOwnsAsset