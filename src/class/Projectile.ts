import Vector3 from "./Vector3";

export default class Projectile {
    static projectileId: number = 0

    position: Vector3
    diameter: number
    color: string
    velocity: number
    direction: number
    zdirection: number

    destroyTime: number = 8

    constructor(position: Vector3, diameter: number, color: string, direction: number, zdirection: number, velocity: number) {
        Projectile.projectileId += 1

        this.position = position
        this.diameter = diameter
        this.color = color
        this.velocity = velocity
        this.direction = direction
        this.zdirection = zdirection
    }
}