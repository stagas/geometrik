import { Class } from 'everyday-types'
import { Line } from './line'
import { Rect } from './rect'
import { Scalar } from './scalar'
import { Shape, ShapeLike } from './shape'

export class Point extends Shape {
  static fromElement(el: HTMLElement) {
    return new Point(
      +(el.dataset.left ?? el.offsetLeft),
      +(el.dataset.top ?? el.offsetTop)
    )
  }

  static fromObject(obj: ShapeLike) {
    return new Point(
      obj.x ?? obj.width,
      obj.y ?? obj.height
    )
  }

  static fromMatrix(matrix: DOMMatrix) {
    return new Point(matrix.e, matrix.f)
  }

  static fromAngle(radians: number) {
    return new Point(Math.cos(radians), Math.sin(radians))
  }

  static fromAngleDegrees(degrees: number) {
    return Point.fromAngle(Scalar.degreesToRadians(degrees))
  }

  static compare(a: Point | void, b: Point) {
    return a?.equals(b) ?? false
  }

  x!: number
  y!: number

  constructor(obj: ShapeLike)
  constructor(x?: number, y?: number)
  constructor(x: number | ShapeLike = 0, y = x as number) {
    super()
    if (typeof x === 'object')
      Object.assign(this, Point.fromObject(x.toJSON ? x.toJSON() : x))
    else {
      this.x = x
      this.y = y
    }
  }

  [Symbol.iterator]() {
    return [this.x, this.y][Symbol.iterator]()
  }

  toString() {
    return `${this.x} ${this.y}`
  }

  set(other: Point) {
    this.x = other.x
    this.y = other.y
    return this
  }

  draw(this: this, color = 'yellow', position = 'absolute') {
    const div = document.createElement('div')
    Object.assign(div.style, {
      position,
      boxSizing: 'border-box',
      border: '1px solid ' + color,
      ...this.toStylePosition(),
      width: '2px',
      height: '2px',
      zIndex: 1000,
    })
    document.body.appendChild(div)
    return div
  }

  get pos() {
    return new Point(this.x, this.y)
  }
  get position() {
    return this.pos
  }
  get size() {
    return new Point(this.width, this.height)
  }

  get width() {
    return this.x
  }
  set width(x) {
    this.x = x
  }

  get height() {
    return this.y
  }
  set height(y) {
    this.y = y
  }

  interpolate(this: this, other: Point, t: number) {
    return this.clone().interpolateSelf(other, t)
  }
  interpolateSelf(this: this, other: Point, t: number) {
    this.x = this.x + (other.x - this.x) * t
    this.y = this.y + (other.y - this.y) * t
    return this
  }

  diff(this: this, other: Point) {
    return this.clone().diffSelf(other)
  }
  diffSelf(this: this, other: Point) {
    this.x -= other.x
    this.y -= other.y
    return this
  }

  abs(this: this) {
    return this.clone().absSelf()
  }
  absSelf(this: this) {
    this.x = Math.abs(this.x)
    this.y = Math.abs(this.y)
    return this
  }

  square(this: this) {
    return this.clone().squareSelf()
  }
  squareSelf(this: this) {
    this.x *= this.x
    this.y *= this.y
    return this
  }

  sum(this: this) {
    return this.x + this.y
  }

  manhattan(this: this, other: Point) {
    return this.diff(other).absSelf().sum()
  }

  octile(this: this, other: Point) {
    const d = this.diff(other).absSelf()
    const F = Math.SQRT2 - 1
    return (d.x < d.y) ? F * d.x + d.y : F * d.y + d.x
  }

  /** Returns the maximum of its values. */
  max(this: this) {
    return Math.max(this.x, this.y)
  }

  /** Returns the minumum of its values. */
  min(this: this) {
    return Math.min(this.x, this.y)
  }

  clampSelf(this: this, min: number, max: number) {
    if (this.x < min) this.x = min
    else if (this.x > max) this.x = max

    if (this.y < min) this.y = min
    else if (this.y > max) this.y = max

    return this
  }

  clampMinSelf(this: this, min: number) {
    if (this.x < min) this.x = min
    if (this.y < min) this.y = min
    return this
  }

  chebyshev(this: this, other: Point) {
    return this.diff(other).absSelf().max()
  }

  euclidean(this: this, other: Point) {
    return this.distance(other)
  }

  distance(this: this, other: Point) {
    return this.diff(other).mag()
  }

  mag(this: this) {
    return Math.hypot(this.x, this.y)
  }

  length(this: this) {
    return this.mag()
  }

  unit(this: this) {
    return this.scale(1 / this.mag())
  }

  dot(this: this, other: Point) {
    return new Line(this, other).dot()
  }

  normal(this: this) {
    return new Point(this.y, -this.x)
  }

  angleTo(this: this, other: Point) {
    return new Line(this, other).angle()
  }

  round(this: this) {
    return this.clone().roundSelf()
  }
  roundSelf(this: this) {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
    return this
  }

  precisionRound(this: this, p = 1) {
    return this.clone().precisionRoundSelf(p)
  }
  precisionRoundSelf(this: this, p = 1) {
    this.x = Math.round(this.x * p) / p
    this.y = Math.round(this.y * p) / p
    return this
  }

  gridRound(this: this, p = 1) {
    return this.clone().gridRoundSelf(p)
  }
  gridRoundSelf(this: this, p = 1) {
    this.x = Math.round(this.x / p) * p
    this.y = Math.round(this.y / p) * p
    return this
  }

  absoluteSum(this: this) {
    return Math.abs(this.x) + Math.abs(this.y)
  }

  declare absSum: this['absoluteSum']

  withinRect(this: this, other: Rect): boolean {
    return this.x >= other.left
      && this.x <= other.right
      && this.y >= other.top
      && this.y <= other.bottom
  }

  transform(this: this, matrix: DOMMatrix) {
    return this.clone().transformSelf(matrix)
  }
  transformSelf(this: this, matrix: DOMMatrix) {
    const { x, y } = this
    const { a, b, c, d, e, f } = matrix
    this.x = a * x + c * y + e
    this.y = b * x + d * y + f
    return this
  }

  multiply(this: this, x: Shape): InstanceType<Class<typeof this>>
  multiply(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  multiply(this: this, x: number | Shape = 0, y = x as number) {
    return this.clone().multiplySelf(x as number, y)
  }
  multiplySelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  multiplySelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  multiplySelf(this: this, x: number | Shape = 0, y = x as number) {
    if (x instanceof Shape) {
      this.x *= x.x
      this.y *= x.y
    } else {
      this.x *= x
      this.y *= y
    }
    return this
  }

  normalize(this: this, other: DOMMatrix): InstanceType<Class<typeof this>>
  normalize(this: this, other: Point): InstanceType<Class<typeof this>>
  normalize(this: this, other: Rect): InstanceType<Class<typeof this>>
  normalize(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  normalize(this: this): InstanceType<Class<typeof this>>
  normalize(this: this, x?: number | Point | Rect | DOMMatrix, y: number = x as number) {
    return this.clone().normalizeSelf(x as number, y as number)
  }
  normalizeSelf(this: this, other: DOMMatrix): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, other: Point): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, other: Rect): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  normalizeSelf(this: this): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, x: number | Point | Rect | DOMMatrix = this.mag(), y: number = x as number) {
    if (x instanceof DOMMatrix) {
      this.x = (this.x - x.e) / x.a
      this.y = (this.y - x.f) / x.d
    } else if (x instanceof Rect) {
      this.x = (this.x - x.x) / x.width
      this.y = (this.y - x.y) / x.height
    } else if (typeof x === 'number') {
      this.x /= x
      this.y /= y
    } else {
      this.x /= x.x
      this.y /= x.y
    }
    return this
  }

  equals(this: this, other: Point) {
    return this.x === other.x && this.y === other.y
  }

  equalsAny(this: this, other: Point) {
    return this.x === other.x || this.y === other.y
  }
}

Point.prototype.absSum = Point.prototype.absoluteSum
