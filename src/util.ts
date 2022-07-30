import { Point } from './point'

// Cardinal spline - a uniform Catmull-Rom spline with a tension option
export const cardinal = (data: Point[], closed: boolean, tension?: number) => {
  if (data.length < 1) return 'M 0 0'
  if (tension == null) tension = 1

  const size = data.length - (closed ? 0 : 1)

  const path = [`M ${data[0]} C`] as (string | number)[]

  for (let i = 0; i < size; i++) {
    let p0: Point, p1: Point, p2: Point, p3: Point

    if (closed) {
      p0 = data[(i - 1 + size) % size]
      p1 = data[i]
      p2 = data[(i + 1) % size]
      p3 = data[(i + 2) % size]
    } else {
      p0 = i == 0 ? data[0] : data[i - 1]
      p1 = data[i]
      p2 = data[i + 1]
      p3 = i == size - 1 ? p2 : data[i + 2]
    }

    const x1 = p1.x + ((p2.x - p0.x) / 6) * tension
    const y1 = p1.y + ((p2.y - p0.y) / 6) * tension

    const x2 = p2.x - ((p3.x - p1.x) / 6) * tension
    const y2 = p2.y - ((p3.y - p1.y) / 6) * tension

    path.push(x1, y1, x2, y2, p2.x, p2.y)
  }

  closed && path.push('z')

  return path.join(' ')
}
