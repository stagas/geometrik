export class Matrix extends DOMMatrix {
  constructor(matrix?: string | number[] | DOMMatrix) {
    if (typeof matrix === 'string') {
      // TODO: parse matrix string
      super()
    } else if (Array.isArray(matrix)) {
      super(matrix)
    } else if (typeof matrix === 'object') {
      super(Object.values(matrix))
    } else {
      super(matrix)
    }
  }
  toJSON() {
    return this.toFloat64Array()
  }
}
