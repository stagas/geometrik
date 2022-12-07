import { Scalar } from './scalar'

export class Vec3 {
  x: number
  y: number
  z: number

  constructor(x = 0, y = x, z = x) {
    this.x = x
    this.y = y
    this.z = z
  }

  [Symbol.iterator]() {
    return [this.x, this.y, this.z][Symbol.iterator]()
  }

  toString() {
    return `${this.x} ${this.y} ${this.z}`
  }

  set(other: Vec3) {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    return this
  }

  interpolate() {
    return Scalar.interpolate(
      this.y,
      this.x,
      this.z
    )
  }
}
