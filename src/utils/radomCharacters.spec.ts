import { describe, expect, it } from 'vitest'
import { generateSixRandomCharacters } from './randomCharacters'

describe('Url alias test', () => {
  it('Deve ser possivel gerar caracteres aleatorios', () => {
    const firsSix = generateSixRandomCharacters()
    const anotherSix = generateSixRandomCharacters()

    expect(firsSix).not.toBe(anotherSix)
  })

  it('Deve ser possivel gerar 6 caracteres', () => {
    const six = generateSixRandomCharacters()
    expect(six).toHaveLength(6)
  })
})
