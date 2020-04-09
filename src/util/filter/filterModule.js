const filterList = require("./filter.json")

const regex = new RegExp(filterList.join("|"), "i")

function getFilter() {
    return filterList
}

function isSwear(input) {
    return regex.test(input)
}

module.exports = { getFilter, isSwear }