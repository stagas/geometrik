import { Rect } from '../src'

describe('clone', () => {
  it('clones instance', () => {
    const rect = new Rect()
    const res = rect.clone()
    expect(res).toBeInstanceOf(Rect)
  })

  it('clones extended', () => {
    class Foo extends Rect {}
    const foo = new Foo()
    const res = foo.clone()
    expect(res).toBeInstanceOf(Foo)
  })
})
