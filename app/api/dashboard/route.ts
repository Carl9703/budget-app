// app/api/dashboard/route.ts - Z OBSŁUGĄ ZAMKNIĘTEGO MIESIĄCA
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { initializeUserData } from '@/lib/db/seed'

const USER_ID = 'default-user'

interface Transaction {
    id: string
    userId: string
    type: string
    amount: number
    description: string | null
    date: Date
    envelopeId: string | null
}

export async function GET() {
    try {
        // Sprawdź czy użytkownik istnieje, jeśli nie - utwórz
        let user = await prisma.user.findUnique({
            where: { id: USER_ID }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: USER_ID,
                    email: 'user@example.com',
                    name: 'Użytkownik'
                }
            })

            // Zainicjalizuj dane
            await initializeUserData(USER_ID)
        }

        // Pobierz koperty
        const envelopes = await prisma.envelope.findMany({
            where: { userId: USER_ID },
            orderBy: { name: 'asc' }
        })

        // Pobierz WSZYSTKIE transakcje do obliczenia salda (wykluczając operacje zamknięcia)
        const allTransactions = await prisma.transaction.findMany({
            where: {
                userId: USER_ID,
                type: { in: ['income', 'expense'] },
                NOT: [
                    {
                        description: {
                            contains: 'Zamknięcie miesiąca'
                        }
                    },
                    {
                        description: {
                            contains: 'przeniesienie bilansu'
                        }
                    }
                ]
            }
        })

        // Oblicz rzeczywiste saldo konta głównego
        const totalAllIncome = allTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalAllExpenses = allTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        const balance = totalAllIncome - totalAllExpenses

        // ✅ SPRAWDŹ CZY MIESIĄC ZOSTAŁ ZAMKNIĘTY
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Sprawdź czy istnieje transakcja zamknięcia miesiąca
        const monthCloseTransaction = await prisma.transaction.findFirst({
            where: {
                userId: USER_ID,
                description: {
                    contains: 'Zamknięcie miesiąca'
                },
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        })

        // ✅ POPRAWKA: Pobierz transakcje z bieżącego miesiąca
        let monthTransactions: Transaction[] = []

        if (monthCloseTransaction) {
            // Jeśli miesiąc był zamknięty, pokaż tylko transakcje AFTER zamknięcia
            monthTransactions = await prisma.transaction.findMany({
                where: {
                    userId: USER_ID,
                    date: {
                        gt: monthCloseTransaction.date, // Po dacie zamknięcia (większe niż)
                        lte: endOfMonth
                    },
                    type: { in: ['income', 'expense'] },
                    NOT: {
                        description: {
                            contains: 'Zamknięcie miesiąca'
                        }
                    }
                }
            })
        } else {
            // Jeśli miesiąc NIE był zamknięty, pokaż wszystkie transakcje
            monthTransactions = await prisma.transaction.findMany({
                where: {
                    userId: USER_ID,
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    },
                    type: { in: ['income', 'expense'] },
                    NOT: {
                        description: {
                            contains: 'Zamknięcie miesiąca'
                        }
                    }
                }
            })
        }

        // Oblicz statystyki miesięczne
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        // ✅ DEBUG - sprawdź co się dzieje
        console.log('=== DASHBOARD DEBUG ===')
        console.log('Month close transaction:', monthCloseTransaction ? 'EXISTS' : 'NONE')
        console.log('Month transactions count:', monthTransactions.length)
        console.log('Total income:', totalIncome)
        console.log('Total expenses:', totalExpenses)
        console.log('========================')

        const isMonthClosed = !!monthCloseTransaction

        // POLICZ AKTYWNOŚĆ KOPERT - ile transakcji miała każda koperta w tym miesiącu
        const envelopeActivity: { [key: string]: number } = {}

        monthTransactions
            .filter(t => t.type === 'expense' && t.envelopeId)
            .forEach(transaction => {
                const envelopeId = transaction.envelopeId!
                envelopeActivity[envelopeId] = (envelopeActivity[envelopeId] || 0) + 1
            })

        const monthlyEnvelopes = envelopes
            .filter(e => e.type === 'monthly')
            .map(e => {
                let spent = 0

                if (e.currentAmount < 0) {
                    spent = e.plannedAmount + Math.abs(e.currentAmount)
                } else if (e.currentAmount >= e.plannedAmount) {
                    spent = 0
                } else {
                    spent = e.plannedAmount - e.currentAmount
                }

                return {
                    id: e.id,
                    name: e.name,
                    icon: e.icon,
                    spent: spent,
                    planned: e.plannedAmount,
                    current: e.currentAmount,
                    activityCount: envelopeActivity[e.id] || 0
                }
            })
            .sort((a, b) => {
                if (a.activityCount !== b.activityCount) {
                    return b.activityCount - a.activityCount
                }
                return a.name.localeCompare(b.name)
            })

        const yearlyEnvelopes = envelopes
            .filter(e => e.type === 'yearly')
            .map(e => ({
                id: e.id,
                name: e.name,
                icon: e.icon,
                spent: e.currentAmount,
                planned: e.plannedAmount,
                current: e.currentAmount
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({
            balance,
            totalIncome,
            totalExpenses,
            monthlyEnvelopes,
            yearlyEnvelopes,
            transactions: monthTransactions.slice(0, 10),
            isMonthClosed // ✅ DODANA INFORMACJA O STANIE MIESIĄCA
        })

    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json(
            { error: 'Błąd pobierania danych' },
            { status: 500 }
        )
    }
}