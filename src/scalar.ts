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
}
