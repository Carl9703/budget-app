// app/api/close-month/route.ts - OPCJA A: Przenoś tylko bilans miesiąca
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

const USER_ID = 'default-user'

export async function POST() {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Pobierz transakcje z bieżącego miesiąca (wykluczając operacje zamknięcia)
        const monthTransactions = await prisma.transaction.findMany({
            where: {
                userId: USER_ID,
                date: {
                    gte: startOfMonth
                },
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

        console.log('=== DEBUG CLOSE MONTH - OPTION A ===')

        // Oblicz FAKTYCZNY bilans miesiąca (przychody - wydatki)
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

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
            if (envelope.currentAmount > 0) {
                totalUnusedFunds += envelope.currentAmount
                envelopeDetails.push({
                    name: envelope.name,
                    icon: envelope.icon,
                    remaining: envelope.currentAmount
                })
            } else if (envelope.currentAmount < 0) {
                envelopeDetails.push({
                    name: envelope.name,
                    icon: envelope.icon,
                    overrun: Math.abs(envelope.currentAmount)
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

                await prisma.envelope.update({
                    where: { id: freedomEnvelope.id },
                    data: {
                        currentAmount: freedomEnvelope.currentAmount + totalToTransfer
                    }
                })

                // Utwórz transakcję księgową dla równowagi
                await prisma.transaction.create({
                    data: {
                        userId: USER_ID,
                        type: 'expense',
                        amount: totalToTransfer,
                        description: '💰 Zamknięcie miesiąca - przeniesienie bilansu',
                        date: now,
                        envelopeId: freedomEnvelope.id
                    }
                })
            }
        }

        // Reset wszystkich kopert miesięcznych do 0
        for (const envelope of monthlyEnvelopes) {
            await prisma.envelope.update({
                where: { id: envelope.id },
                data: {
                    currentAmount: 0
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