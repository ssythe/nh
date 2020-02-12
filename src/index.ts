import { resolve, basename} from "path"

import * as fs from "fs"

import { promisify } from "util"

import { NodeVM, NodeVMOptions, VMScript } from "vm2"

import Game from "./class/game"

import Team from "./class/team"

import Brick from "./class/brick"

import Bot from "./class/bot"

import { randomHexColor } from "./util/color/color"

import PacketBuilder from "./util/net/packetBuilder"

import Vector3 from "./class/vector3"

import { loadBrk } from "./scripts"

import Tool from "./class/tool"

import Outfit from "./class/outfit"

const phin = require("phin")
    .defaults({"parse": "json", "timeout": 12000})

const NPM_LATEST_VERSION = "https://registry.npmjs.org/node-hill/latest"

const CORE_DIRECTORY = resolve(__dirname, "./core_scripts")

let builtinModules = []

export interface Utilies {
    /** Returns a random hex string. */
    randomHexColor: () => string
}

/**
 * Contains all the global variables that are copied into the VM.
 */
export interface VM_GLOBALS {
    /**@global */
    Game: typeof Game

    /**
     * @global
     * Shortcut to {@link Game.world}
     * */
    world: typeof Game.world

    /** @global */
    Team: typeof Team

    /** @global */
    Tool: typeof Tool

    /** @global */
    Brick: typeof Brick

    /** @global */
    Bot: typeof Bot

    /** @global
     * Used for setting or reading object positions / scale / etc.
    */
    Vector3: typeof Vector3

    /**@global
     * Used for setting a player / bot's body colors + assets.
     */
    Outfit: typeof Outfit

    /** @global 
     * Used internally by the library to create and distribute Brick Hill legacy client-compatible packets. \
     * This is intended for advanced users, but allows you to have complete control over the client.
    */
    PacketBuilder: typeof PacketBuilder

    /** @global
     * Will eventually contain handy functions. But for now only contains randomHexColor().
     */
    util: Utilies

    /**
     * A promisified version of setTimeout, useful for writing timeouts syncronously.
     * @global
     * @example
     * ```js
     * Game.on("playerJoin", async(player) => {
     *  player.message("After 5 seconds, you're gone!")
     *  await sleep(5000)
     *  player.kick("Time's up!")
     * })
     */
    sleep: Promise<void>

    /**
     * Used for locking functions until a specified time has passed.
     * @global
     * @example
     * ```js
     * Game.on("playerJoin", (player) => {
     *    player.on("click", debounce(() => {
     *        console.log("You clicked! But now you can't for 5 seconds.")
     *    }, 5000))
     * })
     * ```
     */
    debounce: (callback: Function, delay: number) => void
}

function vmLoadCoreScripts(vm: NodeVM) {
    fs.readdirSync(CORE_DIRECTORY).forEach((file) => {
        if (!file.endsWith(".js")) return
        if (!Game.coreScriptsDisabled.includes(file)) {
            const coreScript = resolve(CORE_DIRECTORY, file)
            try {
                const script = fs.readFileSync(coreScript, "UTF-8")
                vm.run(new VMScript(script), coreScript)
                console.log(`[*] Loaded Core Script: ${file}`)
            } catch (err) {
                console.error(err)
            }
        } else {
            console.log(`[*] Disabled Core Script: ${file}`)
        }
    })
}

function vmLoadScriptsInDir(vm: NodeVM, dir: string) {
    fs.readdirSync(dir).forEach((file) => {
        if (!file.endsWith(".js")) return
        const userScriptData = resolve(dir, file)
        try {
            const script = fs.readFileSync(userScriptData, "UTF-8")
            vm.run(new VMScript(script), userScriptData)
            console.log(`[*] Loaded User Script: ${file}`)
        } catch (err) {
            console.error(err)
        }
    })
}

function loadScripts() {
    const sandbox = {
        Game: Game,
    
        world: Game.world,

        Team: Team,

        Brick: Brick,

        Bot: Bot,

        Outfit: Outfit,

        util: { randomHexColor },

        Tool: Tool,

        PacketBuilder: PacketBuilder,

        sleep: promisify(setTimeout),

        Vector3: Vector3,

        debounce: (func, wait) => {
            let timeout
            
            return function() {
                if (timeout) return

                timeout = setTimeout(() => {
                    timeout = null
                }, wait)

                func.apply(this, arguments)
            }
        }
    }

    let VM_SETTINGS: NodeVMOptions = {
        require: { 
            external: true,
            builtin: builtinModules,
        },
        sandbox: sandbox
    }

    const vm = new NodeVM(VM_SETTINGS)

    if (Game.coreScriptsDisabled[0] !== "*")
        vmLoadCoreScripts(vm)
    else
        console.log("[*] All Core Scripts disabled.")

    if (Game.userScripts)
        vmLoadScriptsInDir(vm, Game.userScripts)
}

function initiateMap(map) {
    const mapName = basename(map)

    if (!mapName.endsWith(".brk")) {
        console.log("Map selected is not a .brk file. Aborting.")
        return process.exit(0)
    }

    console.clear()

    Game.mapName = mapName

    try {
        let { environment, bricks, tools, teams, spawns } = loadBrk(map) // Load map (environment, bricks, spawns) into mapBuffer.
        
        Game.world.environment = environment

        Game.world.bricks = bricks

        Game.world.spawns = spawns

        Game.world.tools = tools

        Game.world.teams = teams
    } catch (err) {
        console.error("Failure parsing brk: ", err && err.stack)
        return process.exit(1)
    }

    console.log(`Selected: <Port: ${Game.port} | Game: ${Game.gameId} | Map: ${Game.mapName}>`)
}

export interface GameSettings {
    /**The id of the Brick Hill place. */
    gameId: number,
    /**The port the server will be running on. */
    port?: number,
    /**A link to the .brk file that will be hosted. (ex: `/maps/hello.brk`) */
    map?: string,
    /**An array containing the names of core scripts you do not want to run. \
     * For ex: ["admin.js"] \
     * You can use ["*"] to disable ALL core scripts.
     * @default true
     * 
    */
    coreScriptsDisabled?: Array<string>,

    /**An array containing a list of core nodejs modules you want to use in the vm. for ex: ["fs", "querystring"]. (Use: ["*"] for all).
     *@example
     ```js
     builtin = ["fs"]
     ```
     */
    builtin?: Array<string>,
    
    /**A link to your scripts directory. ex: (`/myfolder/user_scripts`) */
    scripts?: string,
    /**A boolean indicating if the server is locally hosted or not. Uses port 42480 by default. \
     * Port forwarding is not required
     * @default false
    */
    local?: boolean,
}

/** Starts a node-hill server with the specified settings. */
export function startServer(settings: GameSettings) {
    if (!settings.port || isNaN(settings.port)) {
        console.log("No port specified. Defaulted to 42480.")
        settings.port = 42480
    }

    if (!settings.gameId || isNaN(settings.gameId)) {
        console.log("No game ID specified.")
        return process.exit(0)
    }

    if (settings.scripts)
        settings.scripts = resolve(process.cwd(), settings.scripts)

    Game.port = settings.port

    Game.gameId = settings.gameId

    Game.coreScriptsDisabled = settings.coreScriptsDisabled || []

    Game.userScripts = settings.scripts

    Game.local = settings.local || false

    builtinModules = settings.builtin || []

    if (!settings.map) {
        console.warn("No map loaded. Using default baseplate.")
        Game.map = false
    } else {
        settings.map = resolve(process.cwd(), settings.map)
        Game.map = settings.map
        initiateMap(Game.map)
    }
    
    Game.serverSettings = settings

    // Do version check
    _getLatestnpmVersion().then((package_version) => {
        if (package_version !== Game.version) {
            console.warn(`Your node-hill version is out of date. [Latest version: ${package_version}]. \nRun \`npm update\` to resolve.`)
        }
    }).catch(() => {
        console.warn("Failure while checking for latest node-hill version.")
    })

    // Start the server
    require("./server")

    // Load user scripts
    loadScripts()
}

async function _getLatestnpmVersion() {
    const data = (await phin({url: NPM_LATEST_VERSION})).body
    return data.version
}

process.on("unhandledRejection", console.error)

module.exports = { startServer }

