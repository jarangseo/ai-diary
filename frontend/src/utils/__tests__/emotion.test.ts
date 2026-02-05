import { describe, it, expect } from 'vitest'
import { getEmotionColor, getEmotionHex } from '../emotion'

describe('getEmotionColor', () => {
  it('returns gray for undefined score', () => {
    expect(getEmotionColor(undefined)).toEqual({
      bg: 'bg-gray-300',
      hover: 'hover:bg-gray-400',
    })
  })

  it('returns indigo for very negative scores (<= -0.6)', () => {
    expect(getEmotionColor(-1)).toEqual({
      bg: 'bg-indigo-400',
      hover: 'hover:bg-indigo-500',
    })
    expect(getEmotionColor(-0.6)).toEqual({
      bg: 'bg-indigo-400',
      hover: 'hover:bg-indigo-500',
    })
  })

  it('returns blue for slightly negative scores (-0.6 < score <= -0.2)', () => {
    expect(getEmotionColor(-0.5)).toEqual({
      bg: 'bg-blue-300',
      hover: 'hover:bg-blue-400',
    })
    expect(getEmotionColor(-0.2)).toEqual({
      bg: 'bg-blue-300',
      hover: 'hover:bg-blue-400',
    })
  })

  it('returns gray for neutral scores (-0.2 < score <= 0.2)', () => {
    expect(getEmotionColor(0)).toEqual({
      bg: 'bg-gray-300',
      hover: 'hover:bg-gray-400',
    })
    expect(getEmotionColor(0.2)).toEqual({
      bg: 'bg-gray-300',
      hover: 'hover:bg-gray-400',
    })
  })

  it('returns yellow for slightly positive scores (0.2 < score <= 0.6)', () => {
    expect(getEmotionColor(0.4)).toEqual({
      bg: 'bg-yellow-300',
      hover: 'hover:bg-yellow-400',
    })
    expect(getEmotionColor(0.6)).toEqual({
      bg: 'bg-yellow-300',
      hover: 'hover:bg-yellow-400',
    })
  })

  it('returns orange for very positive scores (> 0.6)', () => {
    expect(getEmotionColor(0.8)).toEqual({
      bg: 'bg-orange-300',
      hover: 'hover:bg-orange-400',
    })
    expect(getEmotionColor(1)).toEqual({
      bg: 'bg-orange-300',
      hover: 'hover:bg-orange-400',
    })
  })
})

describe('getEmotionHex', () => {
  it('returns indigo hex for very negative scores', () => {
    expect(getEmotionHex(-1)).toBe('#818CF8')
    expect(getEmotionHex(-0.6)).toBe('#818CF8')
  })

  it('returns blue hex for slightly negative scores', () => {
    expect(getEmotionHex(-0.5)).toBe('#93C5FD')
    expect(getEmotionHex(-0.2)).toBe('#93C5FD')
  })

  it('returns gray hex for neutral scores', () => {
    expect(getEmotionHex(0)).toBe('#D1D5DB')
    expect(getEmotionHex(0.2)).toBe('#D1D5DB')
  })

  it('returns yellow hex for slightly positive scores', () => {
    expect(getEmotionHex(0.4)).toBe('#FDE047')
    expect(getEmotionHex(0.6)).toBe('#FDE047')
  })

  it('returns orange hex for very positive scores', () => {
    expect(getEmotionHex(0.8)).toBe('#FDBA74')
    expect(getEmotionHex(1)).toBe('#FDBA74')
  })

  it('handles boundary values correctly', () => {
    // Boundary: -0.6
    expect(getEmotionHex(-0.6)).toBe('#818CF8')
    expect(getEmotionHex(-0.59)).toBe('#93C5FD')

    // Boundary: -0.2
    expect(getEmotionHex(-0.2)).toBe('#93C5FD')
    expect(getEmotionHex(-0.19)).toBe('#D1D5DB')

    // Boundary: 0.2
    expect(getEmotionHex(0.2)).toBe('#D1D5DB')
    expect(getEmotionHex(0.21)).toBe('#FDE047')

    // Boundary: 0.6
    expect(getEmotionHex(0.6)).toBe('#FDE047')
    expect(getEmotionHex(0.61)).toBe('#FDBA74')
  })
})
