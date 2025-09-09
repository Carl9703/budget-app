// app/api/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

const USER_ID = 'default-user'

interface MonthlyData {
    month: string
    year: number
    income: number
    expenses: number
    savings: number
    categories: { [key: string]: number }
}

export async function GET() {
    try {
        // Pobierz wszystkie transakcje (WYKLUCZAJĄC transfery przy zamykaniu miesiąca)
        const allTransactions = await prisma.transaction.findMany({
            where: {
                userId: USER_ID,
                type: { in: ['income', 'expense'] },
                NOT: {
                    description: {
                        contains: 'Zamknięcie miesiąca'
                    }
                }
            },
            include: {
                envelope: true
            },
            orderBy: { date: 'asc' }
        })

        // Pobierz koperty dla analizy efficiency
        const envelopes = await prisma.envelope.findMany({
            where: { userId: USER_ID }
        })

        // Grupuj transakcje po miesiącach
        const monthlyData: { [key: string]: MonthlyData } = {}

        for (const transaction of allTransactions) {
            const date = new Date(transaction.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
            const monthName = date.toLocaleDateString('pl-PL', { month: 'long' })
            const year = date.getFullYear()

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthName,
                    year: year,
                    income: 0,
                    expenses: 0,
                    savings: 0,
                    categories: {}
                }
            }

            const month = monthlyData[monthKey]

            if (transaction.type === 'income') {
                month.income += transaction.amount
            } else {
                month.expenses += transaction.amount

                // Kategoryzacja wydatków
                let category = 'Inne'
                if (transaction.envelope?.name) {
                    category = transaction.envelope.name
                } else if (transaction.description) {
                    const desc = transaction.description.toLowerCase()
                    if (desc.includes('transfer: konto wspólne')) category = 'Konto wspólne'
                    else if (desc.includes('transfer: inwestycje')) category = 'Inwestycje'
                    else if (desc.includes('transfer:')) category = 'Transfery'
                }

                if (!month.categories[category]) {
                    month.categories[category] = 0
                }
                month.categories[category] += transaction.amount
            }
        }

        // Oblicz oszczędności dla każdego miesiąca
        Object.values(monthlyData).forEach(month => {
            month.savings = month.income - month.expenses
        })

        // Sortuj chronologicznie
        const sortedMonths = Object.values(monthlyData).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year
            const months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
                'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
            return months.indexOf(a.month) - months.indexOf(b.month)
        })

        // === ANALIZA KATEGORII ===
        const categoryTotals: { [key: string]: number } = {}
        sortedMonths.forEach(month => {
            Object.entries(month.categories).forEach(([category, amount]) => {
                if (!categoryTotals[category]) categoryTotals[category] = 0
                categoryTotals[category] += amount
            })
        })

        const categoryRanking = Object.entries(categoryTotals)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)

        // === ANALIZA KOPERT ===
        const monthlyEnvelopes = envelopes.filter(e => e.type === 'monthly')
        const envelopeAnalysis = monthlyEnvelopes.map(envelope => {
            // Policz ile razy przekroczono budżet
            let overrunCount = 0
            let totalMonths = 0
            let totalSpent = 0

            // Symulacja - w rzeczywistości trzeba by śledzić historię kopert
            sortedMonths.forEach((month: MonthlyData) => {
                const spent = month.categories[envelope.name] || 0
                if (spent > envelope.plannedAmount) overrunCount++
                if (spent > 0) totalMonths++
                totalSpent += spent
            })

            const efficiency = totalMonths > 0 ? Math.round((totalSpent / (envelope.plannedAmount * totalMonths)) * 100) : 0
            const overrunRate = totalMonths > 0 ? Math.round((overrunCount / totalMonths) * 100) : 0

            return {
                name: envelope.name,
                icon: envelope.icon,
                plannedAmount: envelope.plannedAmount,
                efficiency,
                overrunRate,
                totalSpent,
                avgMonthlySpent: totalMonths > 0 ? Math.round(totalSpent / totalMonths) : 0
            }
        })

        // === CELE I PROGNOZY ===
        const yearlyEnvelopes = envelopes.filter(e => e.type === 'yearly' && !e.name.includes('Wolne środki'))
        const goalAnalysis = yearlyEnvelopes.map(envelope => {
            const currentAmount = envelope.currentAmount
            const targetAmount = envelope.plannedAmount
            const progress = Math.round((currentAmount / targetAmount) * 100)

            // Średni miesięczny wkład (oszacowanie)
            const monthsWithData = Math.max(sortedMonths.length, 1)
            const avgMonthlyContribution = currentAmount / monthsWithData

            // Prognoza miesięcy do celu
            const remaining = targetAmount - currentAmount
            const monthsToGoal = avgMonthlyContribution > 0 ? Math.ceil(remaining / avgMonthlyContribution) : Infinity

            return {
                name: envelope.name,
                icon: envelope.icon,
                current: currentAmount,
                target: targetAmount,
                progress,
                avgMonthlyContribution: Math.round(avgMonthlyContribution),
                monthsToGoal: monthsToGoal === Infinity ? null : monthsToGoal
            }
        })

        // === PORÓWNANIA OKRESOWE ===
        const lastMonth = sortedMonths[sortedMonths.length - 1]
        const previousMonth = sortedMonths[sortedMonths.length - 2]

        const monthComparison = previousMonth ? {
            incomeChange: lastMonth.income - previousMonth.income,
            expenseChange: lastMonth.expenses - previousMonth.expenses,
            savingsChange: lastMonth.savings - previousMonth.savings,
            incomeChangePercent: previousMonth.income > 0 ? Math.round(((lastMonth.income - previousMonth.income) / previousMonth.income) * 100) : 0,
            expenseChangePercent: previousMonth.expenses > 0 ? Math.round(((lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100) : 0
        } : null

        // Średnie ruchome (3 miesiące)
        const movingAverages = sortedMonths.slice(-3).reduce((acc, month) => {
            acc.avgIncome += month.income
            acc.avgExpenses += month.expenses
            acc.avgSavings += month.savings
            return acc
        }, { avgIncome: 0, avgExpenses: 0, avgSavings: 0 })

        if (sortedMonths.length >= 3) {
            movingAverages.avgIncome = Math.round(movingAverages.avgIncome / 3)
            movingAverages.avgExpenses = Math.round(movingAverages.avgExpenses / 3)
            movingAverages.avgSavings = Math.round(movingAverages.avgSavings / 3)
        }

        return NextResponse.json({
            monthlyTrends: sortedMonths,
            categoryRanking,
            envelopeAnalysis,
            goalAnalysis,
            monthComparison,
            movingAverages
        })

    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json(
            { error: 'Błąd pobierania analiz' },
            { status: 500 }
        )
    }
}