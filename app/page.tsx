'use client'

import { useState } from 'react'

interface LoanCalculator {
  id: number
  type: 'loan'
  loanAmount: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
}

interface InvestmentCalculator {
  id: number
  type: 'investment'
  currentAge: number
  retirementAge: number
  currentBalance: number
  monthlyContribution: number
  annualReturn: number
  totalContributions: number
  totalValue: number
  growth: number
}

type Calculator = LoanCalculator | InvestmentCalculator

function calculateLoan(calculator: LoanCalculator) {
  const { loanAmount, interestRate, loanTerm } = calculator
  const principal = loanAmount
  const interest = interestRate / 100 / 12
  const payments = loanTerm * 12

  const x = Math.pow(1 + interest, payments)
  const monthly = (principal * x * interest) / (x - 1)

  if (isFinite(monthly)) {
    return {
      monthlyPayment: monthly,
      totalPayment: monthly * payments,
    }
  } else {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
    }
  }
}

function calculateInvestment(calculator: InvestmentCalculator) {
  const { currentAge, retirementAge, currentBalance, monthlyContribution, annualReturn } = calculator
  const years = retirementAge - currentAge
  const months = years * 12
  const monthlyRate = annualReturn / 100 / 12

  // Future value of current balance
  const futureValueOfCurrent = currentBalance * Math.pow(1 + annualReturn / 100, years)

  // Future value of monthly contributions (annuity)
  let futureValueOfContributions = 0
  if (monthlyRate > 0) {
    futureValueOfContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  } else {
    futureValueOfContributions = monthlyContribution * months
  }

  const totalValue = futureValueOfCurrent + futureValueOfContributions
  const totalContributions = currentBalance + monthlyContribution * months
  const growth = totalValue - totalContributions

  return {
    totalContributions,
    totalValue,
    growth,
  }
}

export default function Component() {
  const initialLoan: LoanCalculator = {
    id: 1,
    type: 'loan',
    loanAmount: 200000,
    interestRate: 3.68,
    loanTerm: 12,
    monthlyPayment: 0,
    totalPayment: 0,
  }
  const { monthlyPayment, totalPayment } = calculateLoan(initialLoan)
  initialLoan.monthlyPayment = monthlyPayment
  initialLoan.totalPayment = totalPayment

  const [calculators, setCalculators] = useState<Calculator[]>([initialLoan])

  function updateLoanCalculator(id: number, field: keyof LoanCalculator, value: number) {
    setCalculators((prev) =>
      prev.map((calc) => {
        if (calc.id === id && calc.type === 'loan') {
          const updatedCalc = { ...calc, [field]: value } as LoanCalculator
          const { monthlyPayment, totalPayment } = calculateLoan(updatedCalc)
          return { ...updatedCalc, monthlyPayment, totalPayment }
        }
        return calc
      })
    )
  }

  function updateInvestmentCalculator(id: number, field: keyof InvestmentCalculator, value: number) {
    setCalculators((prev) =>
      prev.map((calc) => {
        if (calc.id === id && calc.type === 'investment') {
          const updatedCalc = { ...calc, [field]: value } as InvestmentCalculator
          const { totalContributions, totalValue, growth } = calculateInvestment(updatedCalc)
          return { ...updatedCalc, totalContributions, totalValue, growth }
        }
        return calc
      })
    )
  }

  function addLoanCalculator(calculatorToDuplicate: LoanCalculator) {
    setCalculators((prev) => {
      const newCalc: LoanCalculator = {
        ...calculatorToDuplicate,
        id: Date.now(),
      }
      const { monthlyPayment, totalPayment } = calculateLoan(newCalc)
      return [...prev, { ...newCalc, monthlyPayment, totalPayment }]
    })
  }

  function addInvestmentCalculator() {
    const birthYear = 1981
    const currentYear = new Date().getFullYear()
    const currentAge = currentYear - birthYear

    const newCalc: InvestmentCalculator = {
      id: Date.now(),
      type: 'investment',
      currentAge,
      retirementAge: 56,
      currentBalance: 300000,
      monthlyContribution: 2000,
      annualReturn: 6,
      totalContributions: 0,
      totalValue: 0,
      growth: 0,
    }
    const { totalContributions, totalValue, growth } = calculateInvestment(newCalc)
    setCalculators((prev) => [...prev, { ...newCalc, totalContributions, totalValue, growth }])
  }

  function removeCalculator(id: number) {
    setCalculators((prev) => prev.filter((calc) => calc.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold uppercase tracking-tight">LA CALCULATRICE</h1>
        <button
          onClick={addInvestmentCalculator}
          className="border border-black px-4 py-2 bg-white hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold"
        >
          + RRSP
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calculator) => (
          <div key={calculator.id} className="border border-black p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  if (calculator.type === 'loan') {
                    addLoanCalculator(calculator)
                  } else {
                    addInvestmentCalculator()
                  }
                }}
                className="border border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors"
              >
                [+]
              </button>
              <button
                onClick={() => removeCalculator(calculator.id)}
                className="border border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors"
              >
                [-]
              </button>
            </div>
            {calculator.type === 'loan' ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">LOAN AMOUNT</label>
                  <input
                    type="text"
                    value={calculator.loanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '')
                      if (!isNaN(Number(value))) {
                        updateLoanCalculator(calculator.id, 'loanAmount', Number(value))
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        updateLoanCalculator(calculator.id, 'loanAmount', calculator.loanAmount + 10000)
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        updateLoanCalculator(calculator.id, 'loanAmount', Math.max(calculator.loanAmount - 10000, 0))
                      }
                    }}
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">INTEREST RATE %</label>
                  <input
                    type="number"
                    value={calculator.interestRate}
                    onChange={(e) => updateLoanCalculator(calculator.id, 'interestRate', Number(e.target.value))}
                    min="0.1"
                    max="20"
                    step="0.1"
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">LOAN TERM (YEARS)</label>
                  <input
                    type="number"
                    value={calculator.loanTerm}
                    onChange={(e) => updateLoanCalculator(calculator.id, 'loanTerm', Number(e.target.value))}
                    min="1"
                    max="30"
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div className="border-t border-black pt-3 space-y-1">
                  <div className="text-lg font-bold">
                    ${calculator.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / MONTH
                  </div>
                  <div className="text-sm">
                    TOTAL: ${calculator.totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm">
                    INTEREST: ${(calculator.totalPayment - calculator.loanAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">CURRENT AGE</label>
                  <input
                    type="number"
                    value={calculator.currentAge}
                    onChange={(e) => updateInvestmentCalculator(calculator.id, 'currentAge', Number(e.target.value))}
                    min="18"
                    max="100"
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">RETIREMENT AGE</label>
                  <input
                    type="number"
                    value={calculator.retirementAge}
                    onChange={(e) => updateInvestmentCalculator(calculator.id, 'retirementAge', Number(e.target.value))}
                    min="18"
                    max="100"
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">CURRENT BALANCE</label>
                  <input
                    type="text"
                    value={calculator.currentBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '')
                      if (!isNaN(Number(value))) {
                        updateInvestmentCalculator(calculator.id, 'currentBalance', Number(value))
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        updateInvestmentCalculator(calculator.id, 'currentBalance', calculator.currentBalance + 10000)
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        updateInvestmentCalculator(calculator.id, 'currentBalance', Math.max(calculator.currentBalance - 10000, 0))
                      }
                    }}
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">MONTHLY CONTRIBUTION</label>
                  <input
                    type="text"
                    value={calculator.monthlyContribution.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '')
                      if (!isNaN(Number(value))) {
                        updateInvestmentCalculator(calculator.id, 'monthlyContribution', Number(value))
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        updateInvestmentCalculator(calculator.id, 'monthlyContribution', calculator.monthlyContribution + 100)
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        updateInvestmentCalculator(calculator.id, 'monthlyContribution', Math.max(calculator.monthlyContribution - 100, 0))
                      }
                    }}
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-xs font-bold">ANNUAL RETURN %</label>
                  <input
                    type="number"
                    value={calculator.annualReturn}
                    onChange={(e) => updateInvestmentCalculator(calculator.id, 'annualReturn', Number(e.target.value))}
                    min="0"
                    max="20"
                    step="0.1"
                    className="w-full border border-black p-2 bg-white"
                  />
                </div>
                <div className="border-t border-black pt-3 space-y-1">
                  <div className="text-lg font-bold">
                    ${calculator.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm">
                    CONTRIBUTIONS: $
                    {calculator.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm">
                    GROWTH: ${calculator.growth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
