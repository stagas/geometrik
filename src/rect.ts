import { Class } from 'everyday-types'
import { Intersect } from './core'
import { Line } from './line'
import { Point } from './point'
import { Shape, ShapeLike } from './shape'

export type Placement = 'nw' | 'nwr' | 'nel' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export class Rect extends Shape implements DOMRect {
  static fromElement(el: HTMLElement & { rect?: Rect }) {
    return el.rect ? el.rect.clone() : new Rect(
      +(el.dataset.x ?? el.offsetLeft),
      +(el.dataset.y ?? el.offsetTop),
      +(el.dataset.width ?? el.offsetWidth),
      +(el.dataset.height ?? el.offsetHeight)
    )
  }

  static fromObject(obj: ShapeLike) {
    return new Rect(
      obj.x ?? obj.width,
      obj.y ?? obj.height,
      obj.width ?? 0,
      obj.height ?? 0
    )
  }

  static fromPoints(topLeft: Point, bottomRight: Point) {
    return new Rect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    )
  }

  static fromUnsortedPoints(p1: Point, p2: Point) {
    const topLeft = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y))
    const bottomRight = new Point(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y))
    return new Rect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    )
  }

  static combine(rects: Rect[]) {
    const x = Math.min(...rects.map(b => b.x))
    const y = Math.min(...rects.map(b => b.y))
    return new Rect(
      x,
      y,
      Math.max(...rects.map(b => b.right)) - x,
      Math.max(...rects.map(b => b.bottom)) - y
    )
  }

  static compare(a: Rect | void, b: Rect) {
    return a?.equals(b) ?? false
  }

  // alias
  static boundingRect = Rect.combine

  x!: number
  y!: number
  width!: number
  height!: number
  #stale = true

  constructor(obj: ShapeLike)
  constructor(x?: number, y?: number, width?: number, height?: number)
  constructor(x: number | ShapeLike = 0, y = x as number, width = x as number, height = y) {
    super()
    if (typeof x === 'object')
      Object.assign(this, Rect.fromObject(x.toJSON ? x.toJSON() : x))
    else {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }
  }

  [Symbol.iterator]() {
    return [this.x, this.y, this.width, this.height][Symbol.iterator]()
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    }
  }

  toSVGPath() {
    return `M ${this.x} ${this.y} h ${this.width} v ${this.height} h ${-this.width} v ${-this.height}`
  }

  toString() {
    return `${this.x} ${this.y} ${this.width} ${this.height}`
  }

  draw(this: this, color = 'red', position = 'absolute') {
    const div = document.createElement('div')
    Object.assign(div.style, {
      position,
      pointerEvents: 'none',
      boxSizing: 'border-box',
      border: '1px solid ' + color,
      ...this.toStyle(),
      zIndex: 1000,
    })
    document.body.appendChild(div)
    return div
  }

  set(this: this, other: Rect) {
    this.x = other.x
    this.y = other.y
    this.width = other.width
    this.height = other.height
    this.#stale = true
    return this
  }

  setWidth(width: number) {
    this.width = width
    return this
  }

  setHeight(height: number) {
    this.height = height
    return this
  }

  setPosition(this: this, other: Shape) {
    this.x = other.x
    this.y = other.y
    this.#stale = true
    return this
  }

  setSize(this: this, other: Shape) {
    this.width = other.width
    this.height = other.height
    this.#stale = true
    return this
  }

  get points() {
    return [
      new Point(this.x, this.y),
      new Point(this.right, this.y),
      new Point(this.right, this.bottom),
      new Point(this.x, this.bottom),
    ]
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
  get center() {
    return new Point(
      this.x + this.width * 0.5,
      this.y + this.height * 0.5
    )
  }

  get topLeft() {
    return this.pos
  }
  get topRight() {
    return new Point(
      this.right,
      this.top
    )
  }
  get bottomLeft() {
    return new Point(
      this.x,
      this.bottom
    )
  }
  get bottomRight() {
    return this.pos.translate(this.size)
  }

  get right() {
    return this.x + this.width
  }
  set right(x) {
    this.x = x - this.width
  }

  get bottom() {
    return this.y + this.height
  }
  set bottom(y) {
    this.y = y - this.height
  }

  #leftLine!: Line
  #topLine!: Line
  #rightLine!: Line
  #bottomLine!: Line
  maybeCalculateLines() {
    if (!this.#stale) return

    this.#leftLine = new Line(
      this.topLeft,
      this.bottomLeft
    )
    this.#topLine = new Line(
      this.topLeft,
      this.topRight
    )
    this.#rightLine = new Line(
      this.topRight,
      this.bottomRight
    )
    this.#bottomLine = new Line(
      this.bottomLeft,
      this.bottomRight
    )
    this.#stale = false
  }

  get leftLine() {
    this.maybeCalculateLines()
    return this.#leftLine
  }
  get topLine() {
    this.maybeCalculateLines()
    return this.#topLine
  }
  get rightLine() {
    this.maybeCalculateLines()
    return this.#rightLine
  }
  get bottomLine() {
    this.maybeCalculateLines()
    return this.#bottomLine
  }

  interpolate(this: this, other: Rect, t: number) {
    return this.clone().interpolateSelf(other, t)
  }
  interpolateSelf(this: this, other: Rect, t: number) {
    this.x = this.x + (other.x - this.x) * t
    this.y = this.y + (other.y - this.y) * t
    this.width = this.width + (other.width - this.width) * t
    this.height = this.height + (other.height - this.height) * t
    return this
  }

  round(this: this) {
    return this.clone().roundSelf()
  }
  roundSelf(this: this) {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
    this.width = Math.round(this.width)
    this.height = Math.round(this.height)
    this.#stale = true
    return this
  }

  multiply(this: this, x: Shape): InstanceType<Class<typeof this>>
  multiply(this: this, x: number, y?: number, w?: number, h?: number): InstanceType<Class<typeof this>>
  multiply(this: this, x: number | Shape = 0, y = x as number, w = x as number, h = y) {
    return this.clone().multiplySelf(x as number, y, w, h)
  }
  multiplySelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  multiplySelf(this: this, x: number, y?: number, w?: number, h?: number): InstanceType<Class<typeof this>>
  multiplySelf(this: this, x: number | Shape = 0, y = x as number, w = x as number, h = y) {
    if (x instanceof Shape) {
      this.x *= x.x
      this.y *= x.y
      this.width *= x.width
      this.height *= x.height
    } else {
      this.x *= x
      this.y *= y
      this.width *= w
      this.height *= h
    }
    this.#stale = true
    return this
  }

  transform(this: this, matrix: DOMMatrix) {
    return this.clone().transformSelf(matrix)
  }
  transformSelf(this: this, matrix: DOMMatrix) {
    const { x, y, width, height } = this
    const { a, b, c, d, e, f } = matrix
    this.x = a * x + c * y + e
    this.y = b * x + d * y + f
    this.width = a * width + c * height
    this.height = b * width + d * height
    this.#stale = true
    return this
  }

  normalize(this: this, matrix: DOMMatrix): InstanceType<Class<typeof this>>
  normalize(this: this, other: Rect): InstanceType<Class<typeof this>>
  normalize(this: this, other: Rect | DOMMatrix) {
    return this.clone().normalizeSelf(other as Rect)
  }
  normalizeSelf(this: this, matrix: DOMMatrix): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, other: Rect): InstanceType<Class<typeof this>>
  normalizeSelf(this: this, other: Rect | DOMMatrix) {
    if (other instanceof DOMMatrix) {
      this.transformSelf(other.inverse())
    } else {
      this.x -= other.left
      this.y -= other.top
      this.x /= other.width
      this.y /= other.height
      this.width /= other.width
      this.height /= other.height
    }
    this.#stale = true
    return this
  }

  equals(this: this, other: Rect) {
    return this.x === other.x && this.y === other.y
      && this.width === other.width && this.height === other.height
  }

  intersectionRect(this: this, other: Rect): Intersect {
    return (this.bottom - 0.75 >= other.top ? Intersect.Top : 0)
      + (this.top + 0.75 <= other.bottom ? Intersect.Bottom : 0)
      + (this.right - 0.75 >= other.left ? Intersect.Left : 0)
      + (this.left + 0.75 <= other.right ? Intersect.Right : 0)
  }

  intersectsRect(this: this, other: Rect): boolean {
    return !(
      this.bottom - 0.75 < other.top || this.top + 0.75 > other.bottom
      || this.right - 0.75 < other.left || this.left + 0.75 > other.right
    )
  }

  withinRect(this: this, other: Rect): boolean {
    return this.left >= other.left
      && this.right <= other.right
      && this.top >= other.top
      && this.bottom <= other.bottom
  }

  distanceRect(this: this, other: Rect): Point {
    let dx = 0
    let dy = 0

    if (this.right < other.left) {
      dx = other.left - this.right
    } else if (this.left > other.right) {
      dx = this.left - other.right
    } else {
      dx = Math.abs(this.center.x - other.center.x)
    }

    if (this.bottom < other.top) {
      dy = other.top - this.bottom
    } else if (this.top > other.bottom) {
      dy = this.top - other.bottom
    } else {
      dy = Math.abs(this.center.y - other.center.y)
    }

    return new Point(dx, dy)
  }

  collisionResponse(this: this, other: Rect): Point {
    return this
      .intersectPoint(other)
      .addSelf(other.center)
      .subSelf(this.center)
  }

  place(this: this, other: Rect, placement: Placement) {
    return this.clone().placeSelf(other, placement)
  }
  placeSelf(this: this, other: Rect, placement: Placement) {
    if (placement.includes('n'))
      this.y = other.top - this.height
    else if (placement.includes('s'))
      this.y = other.bottom
    else
      this.y = other.center.y - this.height * 0.5

    if (placement.includes('w'))
      this.x = other.left - this.width
    else if (placement.includes('e'))
      this.x = other.right
    else
      this.x = other.center.x - this.width * 0.5

    if (placement.includes('r')) {
      this.x += this.width
    }

    if (placement.includes('l')) {
      this.x -= this.width
    }

    this.#stale = true

    return this
  }
}
