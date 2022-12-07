export class Matrix extends DOMMatrix implements DOMMatrix {
  constructor(matrix?: string | number[] | DOMMatrix) {
    if (typeof matrix === 'string') {
      super(matrix.split('(')[1].split(')')[0].split(',').map(parseFloat))
    } else if (Array.isArray(matrix)) {
      super(matrix)
    } else if (matrix instanceof DOMMatrix) {
      super(matrix.toFloat64Array() as unknown as number[])
    } else if (typeof matrix === 'object') {
      super(Object.values(matrix))
    } else {
      super(matrix)
    }
  }
  flipX(): Matrix {
    return new Matrix(super.flipX())
  }
  flipY(): Matrix {
    return new Matrix(super.flipY())
  }
  inverse(): Matrix {
    return new Matrix(super.inverse())
  }
  multiply(other?: DOMMatrixInit | undefined): Matrix {
    return new Matrix(super.multiply(other))
  }
  rotate(rotX?: number | undefined, rotY?: number | undefined, rotZ?: number | undefined): Matrix {
    return new Matrix(super.rotate(rotX, rotY, rotZ))
  }
  rotateAxisAngle(
    x?: number | undefined,
    y?: number | undefined,
    z?: number | undefined,
    angle?: number | undefined,
  ): Matrix {
    return new Matrix(super.rotateAxisAngle(x, y, z, angle))
  }
  rotateFromVector(x?: number | undefined, y?: number | undefined): Matrix {
    return new Matrix(super.rotateFromVector(x, y))
  }
  scale(
    scaleX?: number | undefined,
    scaleY?: number | undefined,
    scaleZ?: number | undefined,
    originX?: number | undefined,
    originY?: number | undefined,
    originZ?: number | undefined,
  ): Matrix {
    return new Matrix(super.scale(scaleX, scaleY, scaleZ, originX, originY, originZ))
  }
  scaleSelf(
    scaleX?: number | undefined,
    scaleY?: number | undefined,
    scaleZ?: number | undefined,
    originX?: number | undefined,
    originY?: number | undefined,
    originZ?: number | undefined,
  ): Matrix {
    super.scaleSelf(scaleX, scaleY, scaleZ, originX, originY, originZ)
    return this
  }
  scale3d(
    scale?: number | undefined,
    originX?: number | undefined,
    originY?: number | undefined,
    originZ?: number | undefined,
  ): Matrix {
    return new Matrix(super.scale3d(scale, originX, originY, originZ))
  }
  skewX(sx?: number | undefined): Matrix {
    return new Matrix(super.skewX(sx))
  }
  skewY(sy?: number | undefined): Matrix {
    return new Matrix(super.skewY(sy))
  }
  translate(tx?: number | undefined, ty?: number | undefined, tz?: number | undefined): Matrix {
    return new Matrix(super.translate(tx, ty, tz))
  }
  translateSelf(tx?: number | undefined, ty?: number | undefined, tz?: number | undefined): Matrix {
    super.translateSelf(tx, ty, tz)
    return this
  }
  clone() {
    return new Matrix(this)
  }
  toJSON() {
    return this.toFloat64Array()
  }
}
