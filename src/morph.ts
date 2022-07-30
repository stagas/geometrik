import type { Point } from './point'
import { Polygon } from './polygon'

export type MorphFn = <T extends Point>(from: T[], to: T[]) => (fi: number, ti: number, t: number) => Point

export class Morph {
  static coeffs = <T>(from: T[], to: T[]) => {
    const fl = from.length
    const tl = to.length

    const length = Math.max(fl, tl)

    const fc = fl / length
    const tc = tl / length

    return [length, fc, tc, fl, tl]
  }

  static Nearest: MorphFn = <T extends Point>(from: T[], to: T[]) => {
    const fl_1 = from.length - 1
    const tl_1 = to.length - 1

    return (fi: number, ti: number, t: number) => {
      const fp = from[Math.min(fi, fl_1)]
      const tp = to[Math.min(ti, tl_1)]
      return fp.interpolate(tp, t)
    }
  }

  static Linear: MorphFn = <T extends Point>(from: T[], to: T[]) =>
    (fi: number, ti: number, t: number) => {
      const fp = Polygon.resample(from, fi, 0.5)
      const tp = Polygon.resample(to, ti, 0.5)
      return fp.interpolate(tp, t)
    }

  static Cubic: MorphFn = <T extends Point>(from: T[], to: T[]) =>
    (fi: number, ti: number, t: number) => {
      const fp = Polygon.resampleCubic(from, fi, 0.5)
      const tp = Polygon.resampleCubic(to, ti, 0.5)
      return fp.interpolate(tp, t)
    }

  static Spline: MorphFn = <T extends Point>(from: T[], to: T[]) =>
    (fi: number, ti: number, t: number) => {
      const fp = Polygon.resampleSpline(from, fi, 0.5)
      const tp = Polygon.resampleSpline(to, ti, 0.5)
      return fp.interpolate(tp, t)
    }
}
