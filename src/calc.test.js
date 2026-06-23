import { describe, it, expect } from 'vitest'
import { computeProjection } from './calc.js'
import { funds, profiles, perfScenarios, PROJECTION_YEARS } from './data.js'

/**
 * These tests verify that `computeProjection` is *mathematically* correct under
 * the model's stated simple assumptions:
 *
 *   1. The portfolio is rebalanced to its target allocation every year, so the
 *      whole balance compounds at a single allocation-weighted `blended` rate.
 *   2. Contributions are made at the END of each year (an ordinary annuity), so
 *      the contribution in year `c` compounds for `n - c` years.
 *   3. `contribData` tracks pure cost basis (principal, no growth); gains are
 *      portfolio value minus cost basis.
 *
 * Expected values are derived INDEPENDENTLY from closed-form formulas rather than
 * re-running the implementation's loop, so the tests can actually catch a wrong
 * implementation instead of mirroring it.
 */

// --- Independent reference implementations -------------------------------------

// Closed-form blended (allocation-weighted) annual rate for a profile/scenario.
const refBlended = (risk, perf) => {
  const { allocs } = profiles[risk - 1]
  return allocs.reduce((s, a, i) => s + (a / 100) * funds[i].rates[perf - 1], 0)
}

// Closed-form future value: lump sum + ordinary annuity.
//   FV = balance·(1+b)^n + C·((1+b)^n − 1)/b      (b ≠ 0)
//   FV = balance + C·n                            (b = 0, removable singularity)
const refFutureValue = (balance, annualContrib, b, n) => {
  const growth = Math.pow(1 + b, n)
  const annuity = b === 0 ? annualContrib * n : annualContrib * ((growth - 1) / b)
  return balance * growth + annuity
}

// A representative, deterministic input. Moderate profile, baseline scenario.
const baseInput = { balance: 100_000, contributors: 2, perAccount: 6_000, risk: 3, perf: 3 }

describe('computeProjection — structural invariants', () => {
  const r = computeProjection(baseInput)

  it('selects the profile and scenario by 1-based index', () => {
    expect(r.profile).toBe(profiles[baseInput.risk - 1])
    expect(r.scenario).toBe(perfScenarios[baseInput.perf - 1])
  })

  it('emits one data point per year, inclusive of year 0', () => {
    expect(r.years).toHaveLength(PROJECTION_YEARS + 1)
    expect(r.years[0]).toBe(0)
    expect(r.years.at(-1)).toBe(PROJECTION_YEARS)
    expect(r.portfolioData).toHaveLength(PROJECTION_YEARS + 1)
    expect(r.contribData).toHaveLength(PROJECTION_YEARS + 1)
    expect(r.gainsData).toHaveLength(PROJECTION_YEARS + 1)
  })

  it('year 0 portfolio value is exactly the starting balance', () => {
    expect(r.portfolioData[0]).toBe(baseInput.balance)
    expect(r.contribData[0]).toBe(baseInput.balance)
    expect(r.gainsData[0]).toBe(0)
  })
})

describe('computeProjection — blended rate', () => {
  it('is the allocation-weighted average of the per-fund scenario rates', () => {
    for (let risk = 1; risk <= profiles.length; risk++) {
      for (let perf = 1; perf <= perfScenarios.length; perf++) {
        const { blended } = computeProjection({ ...baseInput, risk, perf })
        expect(blended).toBeCloseTo(refBlended(risk, perf), 12)
      }
    }
  })

  it('per-fund annual rates come from each fund’s scenario column', () => {
    const { annRates } = computeProjection({ ...baseInput, perf: 4 })
    expect(annRates).toEqual(funds.map((f) => f.rates[3]))
  })
})

describe('computeProjection — annualContrib', () => {
  it('is contributors × perAccount', () => {
    expect(computeProjection(baseInput).annualContrib).toBe(2 * 6_000)
  })
})

describe('computeProjection — portfolio growth matches the closed-form FV', () => {
  // Sweep every profile × scenario, and check every year against the
  // independent lump-sum + ordinary-annuity formula (within rounding tolerance,
  // since the implementation rounds each year to whole dollars).
  it('agrees with FV = balance·(1+b)^n + C·((1+b)^n−1)/b for all years', () => {
    for (let risk = 1; risk <= profiles.length; risk++) {
      for (let perf = 1; perf <= perfScenarios.length; perf++) {
        const input = { ...baseInput, risk, perf }
        const { portfolioData, blended, annualContrib } = computeProjection(input)
        for (let n = 0; n <= PROJECTION_YEARS; n++) {
          const expected = refFutureValue(input.balance, annualContrib, blended, n)
          expect(portfolioData[n]).toBe(Math.round(expected))
        }
      }
    }
  })

  it('places contributions at end-of-year (year-1 value excludes growth on that year’s contribution)', () => {
    // After exactly 1 year: balance grew for a full year, but the single
    // end-of-year contribution has earned nothing yet.
    const { portfolioData, blended, annualContrib } = computeProjection(baseInput)
    const expected = baseInput.balance * (1 + blended) + annualContrib
    expect(portfolioData[1]).toBe(Math.round(expected))
  })

  it('strictly grows year over year when blended > 0 and contributions ≥ 0', () => {
    const { portfolioData } = computeProjection(baseInput) // baseline blended > 0
    for (let n = 1; n <= PROJECTION_YEARS; n++) {
      expect(portfolioData[n]).toBeGreaterThan(portfolioData[n - 1])
    }
  })
})

describe('computeProjection — cost basis and gains', () => {
  const r = computeProjection(baseInput)

  it('contribData is pure principal: balance + annualContrib·year', () => {
    r.contribData.forEach((v, n) => {
      expect(v).toBe(Math.round(baseInput.balance + r.annualContrib * n))
    })
  })

  it('gains = portfolio − cost basis at every year', () => {
    r.gainsData.forEach((g, n) => {
      expect(g).toBe(r.portfolioData[n] - r.contribData[n])
    })
  })

  it('final-year aggregates are consistent with the series', () => {
    expect(r.finalValue).toBe(r.portfolioData[PROJECTION_YEARS])
    expect(r.totalContrib).toBe(r.contribData[PROJECTION_YEARS])
    expect(r.totalGains).toBe(r.gainsData[PROJECTION_YEARS])
    expect(r.totalGains).toBe(r.finalValue - r.totalContrib)
  })
})

describe('computeProjection — ROI', () => {
  it('is round((finalValue / totalContrib − 1) · 100) percent', () => {
    const r = computeProjection(baseInput)
    expect(r.roi).toBe(Math.round((r.finalValue / r.totalContrib - 1) * 100))
  })

  it('is 0 when there is nothing contributed (guards divide-by-zero)', () => {
    const r = computeProjection({ ...baseInput, balance: 0, perAccount: 0 })
    expect(r.totalContrib).toBe(0)
    expect(r.roi).toBe(0)
  })
})

describe('computeProjection — allocation splits', () => {
  const r = computeProjection(baseInput)

  it('fund dollar amounts split the balance by allocation and sum back to it', () => {
    r.fundRows.forEach((row, i) => {
      expect(row.amount).toBeCloseTo((baseInput.balance * row.pct) / 100, 9)
    })
    const sum = r.fundRows.reduce((s, row) => s + row.amount, 0)
    expect(sum).toBeCloseTo(baseInput.balance, 6) // allocs sum to 100%
  })

  it('trade rows split a single per-account contribution and sum back to it', () => {
    const sum = r.tradeRows.reduce((s, row) => s + row.amount, 0)
    expect(sum).toBeCloseTo(baseInput.perAccount, 6)
    r.tradeRows.forEach((row, i) => {
      expect(row.amount).toBeCloseTo((baseInput.perAccount * row.pct) / 100, 9)
    })
  })

  it('every profile’s allocation weights sum to 100%', () => {
    profiles.forEach((p) => {
      expect(p.allocs.reduce((s, a) => s + a, 0)).toBe(100)
    })
  })
})

describe('computeProjection — fees', () => {
  const r = computeProjection(baseInput)

  it('current fee = Σ (fund balance · fee rate)', () => {
    const expected = funds.reduce(
      (s, f, i) => s + ((baseInput.balance * profiles[baseInput.risk - 1].allocs[i]) / 100) * f.fee,
      0,
    )
    expect(r.totalFee).toBeCloseTo(expected, 9)
  })

  it('projected fee = Σ (year-25 fund balance · fee rate)', () => {
    const expected = funds.reduce(
      (s, f, i) => s + ((r.finalValue * profiles[baseInput.risk - 1].allocs[i]) / 100) * f.fee,
      0,
    )
    expect(r.finalFee).toBeCloseTo(expected, 9)
  })

  it('projected fee exceeds current fee when the portfolio grows', () => {
    expect(r.finalFee).toBeGreaterThan(r.totalFee)
  })
})

describe('computeProjection — input sanitization', () => {
  it('floors contributors to 1 (treats 0/undefined as a single account)', () => {
    expect(computeProjection({ ...baseInput, contributors: 0 }).contributors).toBe(1)
    expect(computeProjection({ ...baseInput, contributors: undefined }).contributors).toBe(1)
    expect(computeProjection({ ...baseInput, contributors: -5 }).contributors).toBe(1)
  })

  it('floors perAccount to 0 (negative contributions are clamped away)', () => {
    expect(computeProjection({ ...baseInput, perAccount: -100 }).perAccount).toBe(0)
    expect(computeProjection({ ...baseInput, perAccount: undefined }).perAccount).toBe(0)
  })

  it('a lone investor contributing 0 still just compounds the balance', () => {
    const { portfolioData, blended } = computeProjection({
      ...baseInput,
      contributors: 0,
      perAccount: 0,
    })
    expect(portfolioData[PROJECTION_YEARS]).toBe(
      Math.round(baseInput.balance * Math.pow(1 + blended, PROJECTION_YEARS)),
    )
  })
})

describe('computeProjection — determinism', () => {
  it('is a pure function: identical inputs yield deeply-equal outputs', () => {
    expect(computeProjection(baseInput)).toEqual(computeProjection(baseInput))
  })
})

describe('computeProjection — closed-form annuity is robust at blended = 0', () => {
  // No real profile/scenario yields exactly 0, but the per-year loop must still
  // behave as `balance + C·n` in the limit. We verify the implementation's loop
  // against that limit by constructing the degenerate case analytically: pick a
  // tiny blended via a near-cancelling allocation is impossible with fixed data,
  // so instead we assert the formula the loop implements reduces correctly.
  it('refFutureValue matches the loop summation at small |b|', () => {
    const C = 1000
    const balance = 5000
    const n = 10
    // Sum-of-end-of-year-contributions, computed the same way calc.js does.
    const loopSum = (b) => {
      let total = balance * Math.pow(1 + b, n)
      for (let c = 1; c <= n; c++) total += C * Math.pow(1 + b, n - c)
      return total
    }
    expect(loopSum(0)).toBeCloseTo(refFutureValue(balance, C, 0, n), 6)
    expect(loopSum(0.0001)).toBeCloseTo(refFutureValue(balance, C, 0.0001, n), 6)
  })
})
