import { Line } from './line'
import { Point } from './point'
import { Polygon } from './polygon'

export class Polyline {
  static fromPoints(points: Point[]) {
    return new Polyline(
      points.slice(0, -1).map((p, i) => {
        const next = points[i + 1]
        const line = new Line(p, next)
        return line
      })
    )
  }

  lines: Line[]

  constructor(polyline: Polyline)
  constructor(lines: Line[])
  constructor(lines: Line[] | Polyline) {
    if ((lines as Polyline).lines) {
      this.lines = (lines as Polyline).lines
    } else {
      this.lines = lines as Line[]
    }
  }

  get normals() {
    const mags = this.lines.map(line => line.mag())
    const total = mags.reduce((a, b) => a + b, 0)
    const normals = mags.map(mag => mag / total)
    return normals
  }

  get path() {
    const points: Point[] = []
    for (const line of this.lines) {
      points.push(line.p1)
    }
    points.push(this.lines.at(-1)!.p2)
    return new Polygon(points)
  }

  get length() {
    return this.lines.reduce((a, b) => a + b.mag(), 0)
  }

  chopAt(index: number) {
    const points: Point[] = []
    for (const [i, line] of this.lines.entries()) {
      points.push(line.p1)
      if (i === index) {
        const np = line.p1.interpolate(line.p2, 0.5)
        points.push(np)
      }
    }
    points.push(this.lines.at(-1)!.p2)
    this.lines = Polyline.fromPoints(points).lines
    return this
  }
}
