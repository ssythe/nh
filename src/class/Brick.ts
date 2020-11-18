import { EventEmitter } from "events"

import Game, { Disconnectable } from "./Game"

import createBrickPacket from "../net/BrickHillPackets/brickIds"

import Player from "./Player"

import Vector3 from "./Vector3"

const TOUCH_EVENTS = ["touching", "touchingEnded"]

/**
 * This is used for creating brick objects in Brick Hill.
 * 
 * Example of a brick that can kill players:
 * @example
 * ```js
 * let brick = new Brick(new Vector3(0, 0, 0), new Vector3(5, 5, 5), "#f54242")
 * brick.visibility = 0.5
 * 
 * Game.newBrick(brick) // "Parent" the brick to the game so players will download it.
 * 
 * brick.touching(debounce((p) => {
 *      p.kill()
 * }), 500) // We add a debounce of half a second to prevent double hits.
 */
export default class Brick extends EventEmitter {
    /** The name of the brick. */
    name: string

    /** The current position of the brick. */
    position: Vector3

    /** The current scale of the brick. */
    scale: Vector3

    /** The current color of the brick. */
    color: string

    /** If enabled, the brick will emit lighting. */
    lightEnabled: boolean = false

    /** The current light color (in hex) of the brick. */
    lightColor: string = "#000000"

    /** The range of the brick's lighting. */
    lightRange: number = 5

    /** The visibility of the brick. (1 = fully visible, 0 = invisible)*/
    visibility: number = 0

    /** If .destroy() has been called on the brick. */
    destroyed: boolean

    /** The network id of the brick. */
    netId: number

    /** If the brick is passable by other players. */
    collision: boolean = true

    /** The current rotation of the brick (must be % 90). */
    rotation: number

    /** The asset id the brick will appear as. */
    model: number

    /** Whether or not the brick is a clickable brick. */
    clickable: boolean = false

    /** The minimum distance a player must be to click the brick (if it is a clickable brick). */
    clickDistance: number = 50

    /** If player.newBrick() is called, a socket is attached to the brick, so the brick changes \
     * will be sent to the player instead of everyone.
     */
    socket: Player["socket"]

    /** The shape of the brick. */
    shape: string

    private _hitMonitor?: NodeJS.Timeout

    private _hitMonitorActive: boolean

    private _playersTouching: Set<Player>

    private _steps: Array<NodeJS.Timeout>

    static brickId: number = 0

    constructor(position = new Vector3(0, 0, 0), scale = new Vector3(1, 1, 1), color = "#C0C0C0") {
        super()

        Brick.brickId += 1

        this.destroyed = false
        
        this._steps = []     

        this.position = position

        this.scale = scale

        this.color = color

        this.lightColor = "#000000"

        this.lightRange = 5

        this.visibility = 1

        this.netId = Brick.brickId

        this.collision = true

        this.lightEnabled = false

        this._playersTouching = new Set()

        this._hitMonitorActive = false

        this.on("newListener", (event) => {
            if (!TOUCH_EVENTS.includes(event)) return
            if (!this._hitMonitorActive) {
                this._detectTouching()
                this._hitMonitorActive = true
            }
        })

        this.on("removeListener", (event) => {
            if (event !== "touching") return
            if (this.listenerCount("touching")) return
            clearInterval(this._hitMonitor)
            this._hitMonitorActive = false
        })
    }

    get center() {
        return new Vector3(
            this.position.x + this.scale.x/2, 
            this.position.y + this.scale.y/2, 
            this.scale.z
        )
    }

    async setPosition(position: Vector3) {
        this.position = new Vector3().fromVector(position)
        return createBrickPacket(this, "pos")
    }

    async setScale(scale: Vector3) {
        this.scale = new Vector3().fromVector(scale)
        return createBrickPacket(this, "scale")
    }

    async setRotation(rot: number) {
        this.rotation = rot
        return createBrickPacket(this, "rot")
    }

    async setModel(model: number) {
        this.model = model
        return createBrickPacket(this, "model")
    }

    async setColor(color: string) {
        this.color = color
        return createBrickPacket(this, "col")
    }

    async setLightColor(color: string) {
        if (!this.lightEnabled) 
            return Promise.reject("brick.lightEnabled must be enabled first!")
        this.lightColor = color
        return createBrickPacket(this, "lightcol")
    }

    async setLightRange(range: number) {
        if (!this.lightEnabled) 
            return Promise.reject("brick.lightEnabled must be enabled first!")
        this.lightRange = range
        return createBrickPacket(this, "lightrange")
    }

    async setVisibility(visibility: number) {
        this.visibility = visibility
        return createBrickPacket(this, "alpha")
    }

    async setCollision(collision: boolean) {
        this.collision = collision
        return createBrickPacket(this, "collide")
    }

    async setClickable(clickable: boolean, clickDistance = 50) {
        this.clickable = clickable
        this.clickDistance = clickDistance
        return createBrickPacket(this, "clickable")
    }

    /**
     * Identical to setInterval, but will be cleared after the brick is destroyed.
     * Use this if you want to attach loops to bricks, but don't want to worry about clearing them after they're destroyed.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
    setInterval(callback, delay: number): NodeJS.Timeout {
        let loop = setInterval(callback, delay)
        this._steps.push(loop)
        return loop
    }

    clone() {
        let newBrick = new Brick(this.position, this.scale, this.color)
            newBrick.name = this.name
            newBrick.lightColor = this.lightColor
            newBrick.clickable = this.clickable
            newBrick.clickDistance = this.clickDistance
            newBrick.visibility = this.visibility
            newBrick.collision = this.collision
            newBrick.rotation = this.rotation
            newBrick.lightEnabled = this.lightEnabled
        return newBrick
    }

    async _cleanup() {
        clearInterval(this._hitMonitor)

        this.removeAllListeners()

        this._steps.forEach((loop) => clearInterval(loop))
    }
    
    async destroy() {
        if (this.destroyed) return Promise.reject("Brick has already been destroyed.")

        this._cleanup()

        // This is not a local brick,
        if (!this.socket) {
            const bricks = Game.world.bricks

            const index = bricks.indexOf(this)

            if (index !== -1)
                bricks.splice(index, 1)

        // This is a local brick
        } else {
            const locals = this.socket.player.localBricks

            const index = locals.indexOf(this)

            if (index !== -1)
                locals.splice(index, 1)
        }

        await createBrickPacket(this, "destroy")

        this.socket = null

        this.netId = null

        this._playersTouching = new Set()

        this.destroyed = true
    }

    private _hitDetection() {
        let scale   = []

        let origin  = []

        scale[0]    = this.scale.x/2
        scale[1]    = this.scale.y/2
        scale[2]    = this.scale.z/2

        origin[0]   = this.position.x + scale[0]
        origin[1]   = this.position.y + scale[1]
        origin[2]   = this.position.z + scale[2]

        const players = (this.socket && [ this.socket.player ]) || Game.players

        for (const p of players) {
            let size = []

            size[0] = p.scale.x
            size[1] = p.scale.y
            size[2] = 5 * p.scale.z / 2

            let center = []

            center[0] = p.position.x
            center[1] = p.position.y
            center[2] = p.position.z + size[2]

            let touched = true

            for (let i = 0; i < 3; i++) {
                let dist = Math.abs(origin[i] - center[i])
                let close = size[i] + scale[i]
                if (dist >= close + 0.4) {
                    touched = false
                }
            }

            if (touched && p.alive) {
                this._playersTouching.add(p)
                this.emit("touching", p)
            }

            if (this._playersTouching.has(p) && (!touched || !p.alive)) {
                this._playersTouching.delete(p)
                this.emit("touchingEnded", p)
            }
        }
    }

    /** 
    * Calls the specified callback when a player clicks the brick.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
    * 
    * purpleBrick.clicked((player, secure) => {
    *   if (!secure) return // The server has validated that the player is currently *near* the brick.
    *   console.log(player.username + " clicked this brick!")
    * })
    * ```
    */
    clicked(callback: (player: Player, secure ?: boolean) => void): Disconnectable {
        if (!this.clickable)    
            this.setClickable(true, this.clickDistance)

        let clickEvent = (p) => {
            let secure = false

            if (
                (Math.pow(this.position.x - p.position.x, 2) + 
                Math.pow(this.position.y - p.position.y, 2) +
                Math.pow(this.position.z - p.position.z, 2)
            ) <= this.clickDistance) secure = true

            callback(p, secure)
        }

        this.on("clicked", clickEvent)

        return {
            disconnect: () => {
                this.off("clicked", clickEvent)
                this.setClickable(false)
                return null
            }
        }
    }
    
    /** 
    * Calls the specified callback when a player (who previously touched the brick) steps off of it. \
    * This will fire even if the player dies while touching the brick.
    * 
    * However, if the player leaves the game this will *NOT* fire.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
    * 
    * purpleBrick.touchingEnded((player) => {
    *   console.log("Get back on that brick!")
    * })
    * ```
    */
    touchingEnded(callback: (player: Player) => void): Disconnectable {
        let touchEvent = (p) => {
            callback(p)
        }
        this.on("touchingEnded", touchEvent)
        return {
            disconnect: () => this.off("touchingEnded", touchEvent)
        }
    }

    /** 
    * Calls the specified callback with the player who touched the brick.
    * @callback
    * @example
    * ```js
    * const purpleBrick = world.bricks.find(brick => brick.name === "purpleBrick")
    * 
    * purpleBrick.touching((player) => {
    *   player.kill()
    * })
    * ```
    */
    touching(callback: (player: Player) => void): Disconnectable {
        let touchEvent = (p) => {
            callback(p)
        }
        this.on("touching", touchEvent)
        return {
            disconnect: () => this.off("touching", touchEvent)
        }
    }

    private _detectTouching() {
        this._hitMonitor = setInterval(() => {
            // Release the reference to the player to prevent memory leaks.
            for (let p of this._playersTouching) {
                if (p.destroyed) {
                    this._playersTouching.delete(p)
                }
            }

            if (!Game.playerCount) return

            this._hitDetection()
        }, 100)
    }

    /**
     * Checks if this brick is colliding with another
     * @param brick The brick used to check collision against
     */
    intersects(brick: Brick) : Boolean {
        return  (this.position.x <= brick.position.x+brick.scale.x && this.position.x + this.scale.x >= brick.position.x) &&
                (this.position.y <= brick.position.y+brick.scale.y && this.position.y + this.scale.y >= brick.position.y) &&
                (this.position.z <= brick.position.z+brick.scale.z && this.position.z + this.scale.z >= brick.position.z)
    }
}