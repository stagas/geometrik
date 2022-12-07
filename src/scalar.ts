import { Matrix } from './matrix'

export class Scalar {
  static interpolate(a: number, b: number, t: number) {
    return a + (b - a) * t
  }

  static radiansToDegrees(radians: number) {
    return radians * 180 / Math.PI
  }

  static degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180
  }

  static clamp(min: number, max: number, x: number) {
    return Math.max(min, Math.min(max, x))
  }

  x: number

  constructor(x = 0) {
    this.x = x
  }

  scaleSelf(this: Scalar, x: number) {
    this.x *= x
    return this
  }

  normalizeSelf(this: Scalar, x: number): this
  normalizeSelf(this: Scalar, x: number | Matrix) {
    if (x instanceof Matrix) {
      this.x = (this.x - x.e) / x.a
    } else if (typeof x === 'number') {
      this.x /= x
    }
    return this
  }

  transformSelf(this: Scalar, matrix: Matrix) {
    const { x } = this
    const { a, e } = matrix
    this.x = a * x + e
    return this
  }
}
