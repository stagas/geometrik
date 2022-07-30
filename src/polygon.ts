import { Morph, MorphFn } from './morph'
import { Point } from './point'
import { Polyline } from './polyline'
import { Rect } from './rect'

export class Polygon {
  static toSVGPath(points: Point[]): string {
    return (points.length ? points : [[0, 0]] as any).reduce(
      (p: (number | string)[][], n: Point) => {
        let last = p.at(-1)!
        if (last.length === 3) {
          last = ['L']
          p.push(last)
        }
        last.push(...n)
        return p
      },
      [['M']]
    ).flat(Infinity).join(' ')
  }

  static sum(points: Point[]) {
    return points.reduce((p, n) => {
      p.x += n.x
      p.y += n.y
      return p
    }, new Point())
  }

  static rope(points: Point[], coeff = 1) {
    const from = points[0].clone()
    const to = points.at(-1)!.clone()

    const oldRope = Polyline.fromPoints(points)
    const mags = oldRope.lines.map(line => line.mag())
    const total = mags.reduce((a, b) => a + b, 0)
    const normals = mags.map(mag => mag / total)

    const result = points.slice().map(x => x.clone())
    const pl = points.length
    const pl_1 = pl - 1
    const c = pl_1 / pl

    let p: Point = to.clone()
    for (let i = pl_1; i--;) {
      const t = (i + 1) / pl_1
      const np = result[i]
      const normal = normals[Math.ceil(i * c)]
      const d = p.screen(np).scale(normal).scale(t ** coeff)
      p.translateSelf(d.negate())
      np.translateSelf(d)
      p = np
    }

    result[0] = from.clone()
    result[points.length - 1] = to.clone()
    return result
  }

  static chop(points: Point[], min = 35, max = 240) {
    const from = points[0].clone()
    const to = points.at(-1)!.clone()

    const newRope = Polyline.fromPoints(points)
    const newPoints = []
    let last
    for (const line of newRope.lines) {
      const mag = line.mag()
      if (mag > min) {
        last = newPoints.push(line.p1)
      } else {
        if (last) {
          newPoints[last - 1].translateSelf(line.p1.screen(newPoints[last - 1]).scale(0.5))
        }
      }
      if (mag > max) {
        const d = line.p2.screen(line.p1)
        const np = line.p1.translate(d)
        // newPoints.push(line.p1)
        last = newPoints.push(np)
      }
    }

    newPoints[0] = from.clone()
    newPoints.push(to.clone())

    return newPoints
  }

  static morph(morphFn: MorphFn, from: Point[], to: Point[], t: number) {
    const [length, fc, tc] = Morph.coeffs(from, to)
    const fn = morphFn(from, to)
    return t < 1
      ? Array.from({ length }, (_, i) => {
        const fi = Math.round(i * fc)
        const ti = Math.round(i * tc)
        return fn(fi, ti, t)
      })
      : to
  }

  static resample(points: Point[], index: number, t: number) {
    const pl = points.length
    const pl_1 = pl - 1

    const p_0 = points[Math.min(index, pl_1)]
    const p_1 = points[Math.max(0, index - 1)]
    const p$1 = points[Math.min(index + 1, pl_1)]

    return p_0.interpolate(
      p_1.interpolate(p_0, t)
        .translateSelf(
          p_0.interpolate(p$1, 1 - t)
        ).scale(0.5),
      t
    )
  }

  static fit(points: Point[], length: number) {
    const pl = points.length
    const pl_1 = pl - 1

    const coeff = pl / length

    const newPoints = Array.from({ length }, (_, i) => {
      const index = Math.round(i * coeff)
      const p_0 = points[Math.min(index, pl_1)]
      const p_1 = points[Math.max(0, index - 1)]
      const p$1 = points[Math.min(index + 1, pl_1)]

      return p_0.interpolate(
        p_1.interpolate(p_0, 1)
          .translateSelf(
            p_0.interpolate(p$1, 0)
          ).scale(0.5),
        0.5
      )
    })

    return newPoints
  }

  // https://www.musicdsp.org/en/latest/Other/60-5-point-spline-interpollation.html
  static resampleSpline(points: Point[], index: number, t: number) {
    const pl = points.length
    const pl_1 = pl - 1

    const p0 = points[Math.max(0, index - 2)]
    const p1 = points[Math.max(0, index - 1)]
    const p2 = points[Math.min(index, pl_1)]
    const p3 = points[Math.min(index + 1, pl_1)]
    const p4 = points[Math.min(index + 2, pl_1)]
    const p5 = points[Math.min(index + 3, pl_1)]

    // dprint-ignore
    const x = p2.x + 0.04166666666 * t * ((p3.x - p1.x) * 16.0 + (p0.x - p4.x) * 2.0
      + t * ((p3.x + p1.x) * 16.0 - p0.x - p2.x * 30.0 - p4.x
      + t * (p3.x * 66.0 - p2.x * 70.0 - p4.x * 33.0 + p1.x * 39.0 + p5.x * 7.0 - p0.x * 9.0
      + t * (p2.x * 126.0 - p3.x * 124.0 + p4.x * 61.0 - p1.x * 64.0 - p5.x * 12.0 + p0.x * 13.0
      + t * ((p3.x - p2.x) * 50.0 + (p1.x - p4.x) * 25.0 + (p5.x - p0.x) * 5.0)))))

    // dprint-ignore
    const y = p2.y + 0.04166666666 * t * ((p3.y - p1.y) * 16.0 + (p0.y - p4.y) * 2.0
      + t * ((p3.y + p1.y) * 16.0 - p0.y - p2.y * 30.0 - p4.y
      + t * (p3.y * 66.0 - p2.y * 70.0 - p4.y * 33.0 + p1.y * 39.0 + p5.y * 7.0 - p0.y * 9.0
      + t * (p2.y * 126.0 - p3.y * 124.0 + p4.y * 61.0 - p1.y * 64.0 - p5.y * 12.0 + p0.y * 13.0
      + t * ((p3.y - p2.y) * 50.0 + (p1.y - p4.y) * 25.0 + (p5.y - p0.y) * 5.0)))))

    return new Point(x, y)
  }

  // https://www.musicdsp.org/en/latest/Other/49-cubic-interpollation.html
  static resampleCubic(points: Point[], index: number, t: number) {
    const pl = points.length

    const pl_1 = pl - 1

    const i = (index + t) | 0
    const p_1 = points[Math.min(Math.max(0, i - 1), pl_1)]
    const p0 = points[Math.min(i, pl_1)]
    const p1 = points[Math.min(i + 1, pl_1)]
    const p2 = points[Math.min(i + 2, pl_1)]

    const ax = (3 * (p0.x - p1.x) - p_1.x + p2.x) * 0.5
    const bx = 2 * p1.x + p_1.x - (5 * p0.x + p2.x) * 0.5
    const cx = (p1.x - p_1.x) * 0.5
    const x = (((ax * t) + bx) * t + cx) * t + p0.x

    const ay = (3 * (p0.y - p1.y) - p_1.y + p2.y) * 0.5
    const by = 2 * p1.y + p_1.y - (5 * p0.y + p2.y) * 0.5
    const cy = (p1.y - p_1.y) * 0.5
    const y = (((ay * t) + by) * t + cy) * t + p0.y

    return new Point(x, y)
  }

  static boundingRect(points: Point[]): Rect {
    const minX = Math.min(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxX = Math.max(...points.map(p => p.x))
    const maxY = Math.max(...points.map(p => p.y))

    return new Rect(minX, minY, maxX - minX, maxY - minY)
  }

  // https://github.com/replit/kaboom/blob/d6985fde12b7073cf7bd300c93e1f79a93453a0a/src/math.ts#L867-L902
  static sat(p1: Polygon, p2: Polygon): Point | null {
    let overlap = Number.MAX_VALUE
    let displacement = new Point()
    for (const poly of [p1, p2]) {
      for (let i = 0; i < poly.points.length; i++) {
        const a = poly.points[i]
        const b = poly.points[(i + 1) % poly.points.length]
        const axisProj = b.sub(a).normal().unit()
        let min1 = Number.MAX_VALUE
        let max1 = -Number.MAX_VALUE
        for (let j = 0; j < p1.points.length; j++) {
          const q = p1.points[j].dot(axisProj)
          min1 = Math.min(min1, q)
          max1 = Math.max(max1, q)
        }
        let min2 = Number.MAX_VALUE
        let max2 = -Number.MAX_VALUE
        for (let j = 0; j < p2.points.length; j++) {
          const q = p2.points[j].dot(axisProj)
          min2 = Math.min(min2, q)
          max2 = Math.max(max2, q)
        }
        const o = Math.min(max1, max2) - Math.max(min1, min2)
        if (o < 0) {
          return null
        }
        if (o < Math.abs(overlap)) {
          const o1 = max2 - min1
          const o2 = min2 - max1
          overlap = Math.abs(o1) < Math.abs(o2) ? o1 : o2
          displacement = axisProj.scale(overlap)
        }
      }
    }
    return displacement
  }

  points!: Point[]

  constructor(polygon: Polygon)
  constructor(points?: Point[])
  constructor(polygon: Polygon | Point[] = []) {
    if (Array.isArray(polygon)) {
      this.points = polygon
    } else {
      this.points = polygon.points
    }
  }
}
