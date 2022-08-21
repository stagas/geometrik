import { Point, Rect } from '../src'

let randomSeed = 15151523
function random(x = 1) {
  return (
    (Math.sin(
        10e10 * randomSeed
          * Math.cos(5e10 * ++randomSeed)
      )
        + Math.sin(
          10e10 * randomSeed
            * Math.sin(5e10 * ++randomSeed)
        )
        + Math.sin(
          10e10 * randomSeed
            * Math.cos(5e10 * ++randomSeed)
        ))
      / 3
      * 0.5 + 0.5
  )
    * x
}

const view = new Point(400, 400)
const minSize = 10
const scale = 50
const rects = Array.from(
  { length: 20 },
  () =>
    new Rect(
      random(view.x),
      random(view.y),
      minSize + random(scale),
      minSize + random(scale)
    ) as Rect & { div: HTMLDivElement }
)

for (const r of rects) {
  const div = document.createElement('div')
  ;(r as any).div = div
  const color = `hsl(${random(360)}, 50%, 50%)`
  Object.assign(div.style, r.toStyle(), { position: 'absolute' })
  div.style.backgroundColor = color
  document.body.appendChild(div)
}

const h = rects[0]
window.onpointermove = e => {
  h.x = e.pageX - h.width / 2
  h.y = e.pageY - h.height / 2
  for (const r of rects) {
    if (h === r) continue

    if (h.intersectsRect(r)) {
      const p = h.collisionResponse(r)
      // const c2 = r.intersectPoint(h)
      h.translateSelf(p.scale(0.5))
      r.translateSelf(p.scale(-0.5))
      // r.setPosition(c2.add(h.center).sub(r.size.scale(0.5)))
      // r.translateSelf(c.scale(-0.5))
      Object.assign(r.div.style, r.toStylePosition())
      // h.setPosition(h.touchPoint(r))
    }
  }
  Object.assign(h.div.style, h.toStylePosition())
}
