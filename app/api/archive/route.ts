// app/api/archive/route.ts - NAPRAWIONY dla Decimal
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { Decimal } from '@prisma/client/runtime/library'

const USER_ID = 'default-user'

interface MonthData {
    month: string
    year: number
    income: number
    expenses: number
    balance: number
    categories: { [key: string]: number }
    transactions: TransactionData[]
}

interface TransactionData {
    id: string
    type: string
    amount: number
    description: string
    date: string
    envelope: {
        name: string
        icon: string
    } | null
    category: string
}

// Funkcja pomocnicza do konwersji Decimal na number
function decimalToNumber(decimal: Decimal | number): number {
    if (typeof decimal === 'number') return decimal
    return decimal.toNumber()
}

export async function GET() {
    try {
        // Pobierz wszystkie transakcje
        const allTransactions = await prisma.transaction.findMany({
            where: {
                userId: USER_ID,
                type: { in: ['income', 'expense'] }
            },
            include: {
                envelope: true
            },
            orderBy: { date: 'desc' }
        })

        // Grupuj transakcje po miesiącach
        const monthlyData: { [key: string]: MonthData } = {}

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
                    balance: 0,
                    categories: {},
                    transactions: []
                }
            }

            const monthData = monthlyData[monthKey]

            // POPRAWIONA KATEGORYZACJA
            let categoryName = 'Inne'

            if (transaction.envelope?.name) {
                // Jeśli ma kopertę, użyj nazwy koperty
                categoryName = transaction.envelope.name
            } else if (transaction.description) {
                // Jeśli nie ma koperty, ale ma opis - spróbuj wykryć kategorię z opisu
                const desc = transaction.description.toLowerCase()
                if (desc.includes('transfer: konto wspólne')) {
                    categoryName = 'Konto wspólne'
                } else if (desc.includes('transfer: inwestycje')) {
                    categoryName = 'Inwestycje'
                } else if (desc.includes('transfer:')) {
                    // Inne transfery pozostaną jako "Transfery"
                    categoryName = 'Transfery'
                }
            }

            const amount = decimalToNumber(transaction.amount) // KONWERSJA Decimal → number

            // Dodaj transakcję do miesiąca
            const transactionData: TransactionData = {
                id: transaction.id,
                type: transaction.type,
                amount: amount, // KONWERTOWANA wartość
                description: transaction.description || 'Brak opisu',
                date: transaction.date.toISOString(),
                envelope: transaction.envelope ? {
                    name: transaction.envelope.name,
                    icon: transaction.envelope.icon || '📦'
                } : null,
                category: categoryName
            }

            monthData.transactions.push(transactionData)

            // Aktualizuj sumy
            if (transaction.type === 'income') {
                monthData.income += amount
            } else if (transaction.type === 'expense') {
                monthData.expenses += amount

                // Grupuj wydatki po kategoriach
                if (!monthData.categories[categoryName]) {
                    monthData.categories[categoryName] = 0
                }
                monthData.categories[categoryName] += amount
            }
        }

        // Oblicz bilanse i posortuj transakcje w każdym miesiącu
        Object.values(monthlyData).forEach((month: MonthData) => {
            month.balance = month.income - month.expenses
            month.transactions.sort((a: TransactionData, b: TransactionData) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        })

        // Konwertuj do array i posortuj po dacie (najnowsze pierwsze)
        const result = Object.values(monthlyData).sort((a: MonthData, b: MonthData) => {
            if (a.year !== b.year) return b.year - a.year
            return new Date(`${a.month} 1, ${a.year}`).getTime() - new Date(`${b.month} 1, ${b.year}`).getTime()
        })

        console.log('Archive data with categories:', result[0]?.categories) // Debug

        return NextResponse.json(result)

    } catch (error) {
        console.error('Archive API error:', error)
        return NextResponse.json(
            { error: 'Błąd pobierania archiwum' },
            { status: 500 }
        )
    }
}
