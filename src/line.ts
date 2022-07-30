import { Class } from 'everyday-types'
import { Intersect } from './core'
import { Point } from './point'
import { Rect } from './rect'
import { Scalar } from './scalar'
import { Shape } from './shape'

export class Line {
  p1: Point
  p2: Point

  constructor(line: Line)
  constructor(p1: Point, p2: Point)
  constructor(p1: Point | Line, p2?: Point) {
    if ((p1 as Line).p1) {
      this.p1 = new Point((p1 as Line).p1)
      this.p2 = new Point((p1 as Line).p2)
    } else {
      this.p1 = p1 as Point
      this.p2 = p2 as Point
    }
  }

  [Symbol.iterator]() {
    return this.points[Symbol.iterator]()
  }

  get points() {
    return [this.p1, this.p2]
  }

  angle() {
    const dx = this.p2.x - this.p1.x
    const dy = this.p2.y - this.p1.y
    return Math.atan2(dy, dx)
  }

  angleDegrees() {
    return Scalar.radiansToDegrees(this.angle())
  }

  clone(this: this) {
    const ctor = this.constructor as Class<this>
    return new ctor(this)
  }

  mag(this: this) {
    return this.p1.distance(this.p2)
  }

  dot(this: this) {
    return this.p1.x * this.p2.x + this.p1.y * this.p2.y
  }

  intersectionRect(r: Rect): Intersect {
    const p1 = this.p1
    const p2 = this.p2

    const is = (this.intersectsLine(r.leftLine) ? Intersect.Left : 0)
      + (this.intersectsLine(r.topLine) ? Intersect.Top : 0)
      + (this.intersectsLine(r.rightLine) ? Intersect.Right : 0)
      + (this.intersectsLine(r.bottomLine) ? Intersect.Bottom : 0)
      + ((p1.withinRect(r) && p2.withinRect(r)) ? Intersect.Inside : 0)

    return is
  }

  intersectsRect(r: Rect): Intersect {
    const p1 = this.p1
    const p2 = this.p2

    // dprint-ignore
    return this.intersectsLine(r.leftLine) ? Intersect.Left
      : this.intersectsLine(r.topLine) ? Intersect.Top
      : this.intersectsLine(r.rightLine) ? Intersect.Right
      : this.intersectsLine(r.bottomLine) ? Intersect.Bottom
      : (p1.withinRect(r) && p2.withinRect(r)) ? Intersect.Inside
      : Intersect.None
  }

  intersectsLine(other: Line) {
    const a1 = this.p1
    const a2 = this.p2

    const b1 = other.p1
    const b2 = other.p2

    let q = (a1.y - b1.y) * (b2.x - b1.x) - (a1.x - b1.x) * (b2.y - b1.y)
    const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x)

    if (d == 0) {
      return false
    }

    const r = q / d

    q = (a1.y - b1.y) * (a2.x - a1.x) - (a1.x - b1.x) * (a2.y - a1.y)
    const s = q / d

    if (r < 0 || r > 1 || s < 0 || s > 1) {
      return false
    }

    return true
  }

  // collide line to rectangle and return a new line
  // that is placed just outside of the rectangle and not within
  getLineToRectangleCollisionResponse(this: this, intersection: Intersect, r: Rect): Line {
    if (intersection === Intersect.None) {
      return this
    }

    const p1 = this.p1
    const p2 = this.p2

    const a1 = p1.clone()
    const a2 = p2.clone()

    const b1 = r.topLeft
    const b2 = r.bottomRight

    if (intersection & Intersect.Left) {
      a1.x = b1.x - 1
    }
    if (intersection & Intersect.Top) {
      a1.y = b1.y - 1
    }
    if (intersection & Intersect.Right) {
      a2.x = b2.x + 1
    }
    if (intersection & Intersect.Bottom) {
      a2.y = b2.y + 1
    }
    if (intersection & Intersect.Inside) {
      const p = p1.interpolate(p2, 0.5)
      const tp = p.touchPoint(r)
      a1.x = tp.x
      a1.y = tp.y
      a2.x = tp.x
      a2.y = tp.y
    }

    //   const tp = p.touchPoint(r)

    //   a1.x = tp.x
    //   a1.y = tp.y
    //   a2.x = tp.x
    //   a2.y = tp.y
    // }

    return new Line(a1, a2)
  }

  translate(this: this, x: Shape): InstanceType<Class<typeof this>>
  translate(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  translate(this: this, x: number | Shape = 0, y = x) {
    return this.clone().translateSelf(x as number, y as number)
  }
  translateSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  translateSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  translateSelf(this: this, x: number | Shape = 0, y = x) {
    this.p1.translateSelf(x as number, y as number)
    this.p2.translateSelf(x as number, y as number)
    return this
  }
}
