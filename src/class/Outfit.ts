import Player from "./Player"

import Bot from "./Bot"

/**
 * This is used for setting player & bot body colors + assets.
 * 
 * Using the methods of this class will NOT replicate the player changes to
 * connected clients. But *will* change their values on the server.
 * 
 * To replicate the changes use the {@link Outfit.set} method, or alternatively use: \
 * the {@link Player.setOutfit} and {@link Bot.setOutfit} method.
 * 
 * @example
 * ```js
 * Game.on("playerJoin", (p) => {
 *      p.on("avatarLoaded", () => {
 *          let outfit = new Outfit(p)
 *               // Sets all player colors to "#ffffff"
 *              .body("#ffffff")
 *              // Sets the head color (body colors are still changed!)
 *              .head("#000000")
 *              // Replicate the changes to the players.
 *              .set()
 * 
 *          // Alternatively, you can use: p.setOutfit(outfit)
 *      })
 * })
 * ```
 */
export default class Outfit {
    private _player: Player | Bot

    _idString: Set<string>

    constructor(player: Player | Bot) {
        this._player = player
        this._idString = new Set()
    }

    /** Sets the player's hat1 to the asset id specified. */
    hat1(hatId: number) {
        this._player.assets.hat1 = hatId
        this._idString.add("U")
        return this
    }

    /** Sets the player's hat2 to the asset id specified. */
    hat2(hatId: number) {
        this._player.assets.hat2 = hatId
        this._idString.add("V")
        return this
    }

    /** Sets the player's hat3 to the asset id specified. */
    hat3(hatId: number) {
        this._player.assets.hat3 = hatId
        this._idString.add("W")
        return this
    }

    /** Sets the player's face to the asset id specified. */
    face(faceId: number) {
        this._player.assets.face = faceId
        this._idString.add("Q")
        return this
    }

    /** Sets all of the player's body colors to a hex string. */
    body(color: string) {
        this._player.colors.head = color
        this._idString.add("K")

        this._player.colors.torso = color
        this._idString.add("L")

        this._player.colors.rightArm = color
        this._idString.add("N")

        this._player.colors.leftArm = color
        this._idString.add("M")

        this._player.colors.leftLeg = color
        this._idString.add("O")

        this._player.colors.rightLeg = color
        this._idString.add("P")

        return this
    }

    /** Sets the player's head color to a hex string. */
    head(color: string) {
        this._player.colors.head = color
        this._idString.add("K")
        return this
    }

    /** Sets the player's torso color to a hex string. */
    torso(color: string) {
        this._player.colors.torso = color
        this._idString.add("L")
        return this
    }

    /** Sets the player's right arm color to a hex string. */
    rightArm(color: string) {
        this._player.colors.rightArm = color
        this._idString.add("N")
        return this
    }

    /** Sets the player's left arm color to a hex string. */
    leftArm(color: string) {
        this._player.colors.leftArm = color
        this._idString.add("M")
        return this
    }

    /** Sets the player's left leg color to a hex string. */
    leftLeg(color: string) {
        this._player.colors.leftLeg = color
        this._idString.add("O")
        return this
    }

    /** Sets the player's right leg color to a hex string. */
    rightLeg(color: string) {
        this._player.colors.rightLeg = color
        this._idString.add("P")
        return this
    }

    /** Copies a player's entire outfit (assets + body colors) to this player. */
    fromPlayer(player: Player) {
        this._player.assets = Object.assign({}, player.assets)
        this._player.colors = Object.assign({}, player.colors)
        this._idString = new Set("UVWQKLNMOP")
        return this
    }

    get idString() {
        return Array.from(this._idString).join("")
    }

    /** Calls player.setOutfit(this) */
    set() {
        return this._player.setOutfit(this)
    }
}