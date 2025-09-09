// app/api/close-month/route.ts - NAPRAWIONY dla Decimal
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { Decimal } from '@prisma/client/runtime/library'

const USER_ID = 'default-user'

// Funkcja pomocnicza do konwersji Decimal na number
function decimalToNumber(decimal: Decimal | number): number {
    if (typeof decimal === 'number') return decimal
    return decimal.toNumber()
}

export async function POST() {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // SPRAWDŹ CZY MIESIĄC JUŻ BYŁ ZAMKNIĘTY
        const existingCloseTransaction = await prisma.transaction.findFirst({
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

        if (existingCloseTransaction) {
            return NextResponse.json(
                { 
                    error: 'Miesiąc już został zamknięty',
                    details: `Zamknięcie wykonano: ${existingCloseTransaction.date.toLocaleDateString('pl-PL')}`
                },
                { status: 400 }
            )
        }

        // Pobierz transakcje z bieżącego miesiąca
        const monthTransactions = await prisma.transaction.findMany({
            where: {
                userId: USER_ID,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        })

        console.log('=== DEBUG CLOSE MONTH - OPTION A ===')

        // Oblicz FAKTYCZNY bilans miesiąca (przychody - wydatki)
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + decimalToNumber(t.amount), 0) // KONWERSJA Decimal

        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + decimalToNumber(t.amount), 0) // KONWERSJA Decimal

        const monthBalance = totalIncome - totalExpenses

        console.log('Total income:', totalIncome)
        console.log('Total expenses:', totalExpenses)
        console.log('FAKTYCZNY bilans miesiąca:', monthBalance)

        // Pobierz koperty miesięczne (tylko do informacji o stanie)
        const monthlyEnvelopes = await prisma.envelope.findMany({
            where: {
                userId: USER_ID,
                type: 'monthly'
            }
        })

        // Zbierz informacje o stanie kopert (tylko informacyjnie)
        const envelopeDetails = []
        let totalUnusedFunds = 0

        for (const envelope of monthlyEnvelopes) {
            const currentAmount = decimalToNumber(envelope.currentAmount) // KONWERSJA
            if (currentAmount > 0) {
                totalUnusedFunds += currentAmount
                envelopeDetails.push({
                    name: envelope.name,
                    icon: envelope.icon,
                    remaining: currentAmount
                })
            } else if (currentAmount < 0) {
                envelopeDetails.push({
                    name: envelope.name,
                    icon: envelope.icon,
                    overrun: Math.abs(currentAmount)
                })
            }
        }

        console.log('Informacyjnie - niewykorzystane z kopert:', totalUnusedFunds)

        // OPCJA A: Przenoś TYLKO faktyczny bilans miesiąca
        const totalToTransfer = monthBalance

        console.log('PRZENOSIMY (faktyczny bilans):', totalToTransfer)

        // Przenieś faktyczny bilans do wolnych środków rocznych (jeśli dodatni)
        if (totalToTransfer > 0) {
            const freedomEnvelope = await prisma.envelope.findFirst({
                where: {
                    userId: USER_ID,
                    name: 'Wolne środki (roczne)',
                    type: 'yearly'
                }
            })

            if (freedomEnvelope) {
                console.log(`Transferring BALANCE ${totalToTransfer} to freedom envelope`)

                const currentFreedomAmount = decimalToNumber(freedomEnvelope.currentAmount)
                
                await prisma.envelope.update({
                    where: { id: freedomEnvelope.id },
                    data: {
                        currentAmount: new Decimal(currentFreedomAmount + totalToTransfer) // Konwersja z powrotem na Decimal
                    }
                })

                // UTWÓRZ TRANSAKCJĘ ZAMKNIĘCIA Z UNIKALNYM OPISEM
                await prisma.transaction.create({
                    data: {
                        userId: USER_ID,
                        type: 'expense',
                        amount: new Decimal(totalToTransfer), // Konwersja na Decimal
                        description: `💰 Zamknięcie miesiąca ${now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })} - przeniesienie bilansu`,
                        date: now,
                        envelopeId: freedomEnvelope.id
                    }
                })
            }
        } else {
            // NAWET PRZY DEFICYCIE UTWÓRZ TRANSAKCJĘ ZAMKNIĘCIA
            await prisma.transaction.create({
                data: {
                    userId: USER_ID,
                    type: 'expense',
                    amount: new Decimal(0), // 0 jako Decimal
                    description: `🔒 Zamknięcie miesiąca ${now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })} - deficyt ${Math.abs(totalToTransfer)} zł`,
                    date: now
                }
            })
        }

        // Reset wszystkich kopert miesięcznych do 0
        for (const envelope of monthlyEnvelopes) {
            await prisma.envelope.update({
                where: { id: envelope.id },
                data: {
                    currentAmount: new Decimal(0) // 0 jako Decimal
                }
            })
        }

        console.log('All monthly envelopes reset to 0')
        console.log('=== END DEBUG OPTION A ===')

        const monthName = now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })

        return NextResponse.json({
            success: true,
            monthName,
            summary: {
                totalIncome,
                totalExpenses,
                balance: monthBalance,
                unusedFunds: totalUnusedFunds
            },
            message: totalToTransfer > 0
                ? `Miesiąc ${monthName} zamknięty. ${totalToTransfer} zł (faktyczny bilans) przeniesione do wolnych środków.`
                : monthBalance < 0
                    ? `Miesiąc ${monthName} zamknięty z deficytem ${Math.abs(monthBalance)} zł.`
                    : `Miesiąc ${monthName} zamknięty. Bilans wynosi 0 zł.`
        })

    } catch (error) {
        console.error('Close month API error:', error)
        return NextResponse.json(
            { error: 'Błąd zamykania miesiąca' },
            { status: 500 }
        )
    }
}
