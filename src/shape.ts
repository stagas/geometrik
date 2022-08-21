import { Class } from 'everyday-types'
import { Point, Rect } from './'

export type ShapeLike =
  & ({
    x: number
    y: number
    width?: number
    height?: number
  } | {
    x?: number
    y?: number
    width: number
    height: number
  } | {
    x: number
    y: number
    width: number
    height: number
  })
  & {
    toJSON?: () => ShapeLike
  }

export abstract class Shape {
  abstract x: number
  abstract y: number
  abstract get width(): number
  abstract set width(x)
  abstract get height(): number
  abstract set height(y)

  get left() {
    return this.x
  }
  set left(x) {
    this.x = x
  }

  get top() {
    return this.y
  }
  set top(y) {
    this.y = y
  }

  get bottom() {
    return this.y
  }
  set bottom(y) {
    this.y = y
  }

  get right() {
    return this.x
  }
  set right(x) {
    this.x = x
  }

  clone(this: this) {
    const ctor = this.constructor as Class<this>
    return new ctor(this)
  }

  toJSON(): ShapeLike {
    return this
  }

  draw(color = 'red', position = 'absolute') {
    const div = document.createElement('div')
    Object.assign(div.style, {
      position,
      boxSizing: 'border-box',
      border: '1px solid ' + color,
      ...this.toStyle(),
      zIndex: 1000,
    })
    document.body.appendChild(div)
    return div
  }

  screen(this: this, other: Shape = this) {
    return this.clone().screenSelf(other)
  }
  screenSelf(this: this, other: Shape = this) {
    return this.translateSelf(other.negate())
  }

  negate(this: this) {
    return this.clone().negateSelf()
  }
  negateSelf(this: this) {
    this.x = -this.x
    this.y = -this.y
    return this
  }

  contain(this: this, other: Rect) {
    return this.clone().containSelf(other)
  }
  containSelf(this: this, other: Rect) {
    if (this.top < other.top) this.top = other.top
    else if (this.bottom > other.bottom) this.bottom = other.bottom

    if (this.right > other.right) this.right = other.right
    else if (this.left < other.left) this.left = other.left

    return this
  }

  scale(this: this, x: Shape): InstanceType<Class<typeof this>>
  scale(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  scale(this: this, x: number | Shape = 0, y = x) {
    return this.clone().scaleSelf(x as number, y as number)
  }

  scaleSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  scaleSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  scaleSelf(this: this, x: number | Shape = 0, y = x) {
    if (typeof x === 'object') {
      this.width *= x.width
      this.height *= x.height
    } else {
      this.width *= x
      this.height *= y as number
    }
    return this
  }

  scaleLinear(this: this, x: Shape): InstanceType<Class<typeof this>>
  scaleLinear(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  scaleLinear(this: this, x: number | Shape = 0, y = x) {
    return this.clone().scaleLinearSelf(x as number, y as number)
  }
  scaleLinearSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  scaleLinearSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  scaleLinearSelf(this: this, x: number | Shape = 0, y = x) {
    if (typeof x === 'object') {
      this.width += x.width
      this.height += x.height
    } else {
      this.width += x
      this.height += y as number
    }
    return this
  }

  zoomLinear(this: this, x: Shape): InstanceType<Class<typeof this>>
  zoomLinear(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  zoomLinear(this: this, x: number | Shape = 0, y = x) {
    return this.clone().zoomLinearSelf(x as number, y as number)
  }
  zoomLinearSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  zoomLinearSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  zoomLinearSelf(this: this, x: number | Shape = 0, y = x) {
    if (x instanceof Shape) {
      this
        .scaleLinearSelf(x)
        .translateSelf(x.scale(-0.5))
    } else {
      this
        .scaleLinearSelf(x as number, y as number)
        .translateSelf(x as number * -0.5, y as number * -0.5)
    }
    return this
  }

  add(this: this, x: Shape): InstanceType<Class<typeof this>>
  add(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  add(this: this, x: number | Shape = 0, y = x) {
    return this.translate(x as number, y as number)
  }
  addSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  addSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  addSelf(this: this, x: number | Shape = 0, y = x) {
    return this.translateSelf(x as number, y as number)
  }

  sub(this: this, x: Shape): InstanceType<Class<typeof this>>
  sub(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  sub(this: this, x: number | Shape = 0, y = x) {
    return this.clone().subSelf(x as number, y as number)
  }
  subSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  subSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  subSelf(this: this, x: number | Shape = 0, y = x) {
    if (typeof x === 'object') {
      return this.translateSelf(x.negate())
    } else {
      return this.translateSelf(-x as number, -y as number)
    }
  }

  translate(this: this, x: Shape): InstanceType<Class<typeof this>>
  translate(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  translate(this: this, x: number | Shape = 0, y = x) {
    return this.clone().translateSelf(x as number, y as number)
  }
  translateSelf(this: this, x: Shape): InstanceType<Class<typeof this>>
  translateSelf(this: this, x: number, y?: number): InstanceType<Class<typeof this>>
  translateSelf(this: this, x: number | Shape = 0, y = x) {
    if (typeof x === 'object') {
      this.x += x.x || 0
      this.y += x.y || 0
    } else {
      this.x += x
      this.y += y as number
    }
    return this
  }

  touchPoint(this: this, other: Rect, center = (this as unknown as Rect).center ?? this): Point {
    const self = this instanceof Rect ? this : new Point(1, 1)
    const i = this.intersectPoint(other, center).translateSelf(other.center)

    const x = i.x - self.width * 0.5
    const y = i.y - self.height * 0.5

    return new Point(x, y)
  }

  intersectPoint(this: this, other: Rect, center = (this as unknown as Rect).center ?? this): Point {
    const self = this instanceof Rect ? this : new Point(1, 1)
    const w = (self.width + other.width) * 0.5
    const h = (self.height + other.height) * 0.5
    const d = center.screen(other.center)

    // if A=B return B itself
    const tan_phi = h / w
    const tan_theta = Math.abs(d.y / d.x)

    // tell me in which quadrant the A point is
    const qx = Math.sign(d.x)
    const qy = Math.sign(d.y)

    let xI, yI

    if (tan_theta > tan_phi) {
      xI = (h / tan_theta) * qx
      yI = h * qy
    } else {
      xI = w * qx
      yI = w * tan_theta * qy
    }

    return new Point(xI, yI)
  }

  toStylePosition(): Partial<CSSStyleDeclaration> {
    return {
      left: this.x + 'px',
      top: this.y + 'px',
    }
  }

  toStyleSize(): Partial<CSSStyleDeclaration> {
    return {
      width: this.width + 'px',
      height: this.height + 'px',
    }
  }

  toStyle(): Partial<CSSStyleDeclaration> {
    return {
      ...this.toStylePosition(),
      ...this.toStyleSize(),
    }
  }

  toPositionObject() {
    return {
      x: this.x,
      y: this.y,
    }
  }

  toSizeObject() {
    return {
      width: this.width,
      height: this.height,
    }
  }
}
