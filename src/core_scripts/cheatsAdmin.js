let phin = require("phin").defaults({timeout: 12000})

const SOURCE_URL = "https://raw.githubusercontent.com/penguib/cheats-admin/master/commands.js"

async function init() {
    let data = await phin({url: SOURCE_URL})
    eval(data.body.toString())
    console.log("Successfully loaded cheats-admin!")
}

init().catch(() => {
    console.log("Failure loading cheats-admin.")
})