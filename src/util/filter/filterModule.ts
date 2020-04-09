const filterList = require("./filter.json")

const regex = new RegExp(filterList.join("|"), "i")

export interface filterModule {
    getFilter(): string[]
    isSwear(input: string): boolean
}

function getFilter(): string[] {
    return filterList
}

function isSwear(input: string): boolean {
    return regex.test(input)
}

export default { getFilter, isSwear }