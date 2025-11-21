'use client'

import { useState } from 'react'

interface Calculator {
  id: number
  loanAmount: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
}

export default function Component() {
  const [calculators, setCalculators] = useState<Calculator[]>([
    {
      id: 1,
      loanAmount: 100000,
      interestRate: 5,
      loanTerm: 15,
      monthlyPayment: 0,
      totalPayment: 0,
    },
  ])

  function calculateLoan(calculator: Calculator) {
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

  function updateCalculator(id: number, field: keyof Calculator, value: number) {
    setCalculators((prev) =>
      prev.map((calc) => {
        if (calc.id === id) {
          const updatedCalc = { ...calc, [field]: value }
          const { monthlyPayment, totalPayment } = calculateLoan(updatedCalc)
          return { ...updatedCalc, monthlyPayment, totalPayment }
        }
        return calc
      })
    )
  }

  function addCalculator(calculatorToDuplicate: Calculator) {
    setCalculators((prev) => {
      const newCalc = {
        ...calculatorToDuplicate,
        id: Date.now(),
      }
      const { monthlyPayment, totalPayment } = calculateLoan(newCalc)
      return [...prev, { ...newCalc, monthlyPayment, totalPayment }]
    })
  }

  function removeCalculator(id: number) {
    setCalculators((prev) => prev.filter((calc) => calc.id !== id))
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-8 uppercase tracking-tight">LA CALCULATRICE</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calculator) => (
          <div key={calculator.id} className="border border-black p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => addCalculator(calculator)}
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
            <div className="space-y-4">
              <div>
                <label className="block mb-2 uppercase text-xs font-bold">LOAN AMOUNT</label>
                <input
                  type="text"
                  value={calculator.loanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '')
                    if (!isNaN(Number(value))) {
                      updateCalculator(calculator.id, 'loanAmount', Number(value))
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
                  onChange={(e) => updateCalculator(calculator.id, 'interestRate', Number(e.target.value))}
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
                  onChange={(e) => updateCalculator(calculator.id, 'loanTerm', Number(e.target.value))}
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
          </div>
        ))}
      </div>
    </div>
  )
}
