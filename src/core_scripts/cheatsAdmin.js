// No point in starting the admin commands, user didn't configure them.
if (!Game.serverSettings.cheatsAdmin)
    return

let phin = getModule("phin")
    .defaults({timeout: 12000})

const SOURCE_URL = "https://raw.githubusercontent.com/penguib/cheats-admin/master/commands.js"

async function init() {
    const data = await phin({url: SOURCE_URL})

    // For backwards compatibility
    let body = data.body.toString()
    body = body.replace("require", "getModule")

    eval(body)

    console.log("Successfully loaded cheats-admin!")
}

init().catch((err) => {
    console.log("Failure loading cheats-admin.")
    console.error(err.stack)
})