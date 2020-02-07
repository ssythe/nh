const filter = require("./filter.json")

const regex = new RegExp(filter.join("|"), "i")

function isSwear(input) {
    return regex.test(input)
}

module.exports = isSwear