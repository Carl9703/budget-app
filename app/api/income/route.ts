// app/api/income/route.ts - Z OBSŁUGĄ "INNYCH PRZYCHODÓW"
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

const USER_ID = 'default-user'

export async function POST(request: Request) {
    try {
        const data = await request.json()

        if (data.type === 'salary') {
            // Zapisz wypłatę
            await prisma.transaction.create({
                data: {
                    userId: USER_ID,
                    type: 'income',
                    amount: data.amount,
                    description: data.description || 'Wypłata miesięczna',
                    date: new Date()
                }
            })

            // Transfer do Wesela
            if (data.toSavings > 0) {
                const weseLeEnvelope = await prisma.envelope.findFirst({
                    where: {
                        userId: USER_ID,
                        name: 'Wesele',
                        type: 'yearly'
                    }
                })

                if (weseLeEnvelope) {
                    await prisma.envelope.update({
                        where: { id: weseLeEnvelope.id },
                        data: {
                            currentAmount: weseLeEnvelope.currentAmount + data.toSavings
                        }
                    })

                    await prisma.transaction.create({
                        data: {
                            userId: USER_ID,
                            type: 'expense',
                            amount: data.toSavings,
                            description: 'Transfer: Wesele',
                            date: new Date(),
                            envelopeId: weseLeEnvelope.id
                        }
                    })
                }
            }

            // Transfer do Wakacji
            if (data.toVacation > 0) {
                const vacationEnvelope = await prisma.envelope.findFirst({
                    where: {
                        userId: USER_ID,
                        name: 'Wakacje',
                        type: 'yearly'
                    }
                })

                if (vacationEnvelope) {
                    await prisma.envelope.update({
                        where: { id: vacationEnvelope.id },
                        data: {
                            currentAmount: vacationEnvelope.currentAmount + data.toVacation
                        }
                    })

                    await prisma.transaction.create({
                        data: {
                            userId: USER_ID,
                            type: 'expense',
                            amount: data.toVacation,
                            description: 'Transfer: Wakacje',
                            date: new Date(),
                            envelopeId: vacationEnvelope.id
                        }
                    })
                }
            }

            // Konto wspólne i Inwestycje
            if (data.toJoint > 0) {
                await prisma.transaction.create({
                    data: {
                        userId: USER_ID,
                        type: 'expense',
                        amount: data.toJoint,
                        description: 'Transfer: Konto wspólne',
                        date: new Date()
                    }
                })
            }

            if (data.toInvestment > 0) {
                await prisma.transaction.create({
                    data: {
                        userId: USER_ID,
                        type: 'expense',
                        amount: data.toInvestment,
                        description: 'Transfer: Inwestycje',
                        date: new Date()
                    }
                })
            }

            // Pobierz wszystkie koperty miesięczne
            const monthlyEnvelopes = await prisma.envelope.findMany({
                where: {
                    userId: USER_ID,
                    type: 'monthly'
                },
                orderBy: { name: 'asc' }
            })

            // Definicja alokacji dla kopert
            const allocations: { [key: string]: number } = {
                'Jedzenie': 300,
                'Transport': 300,
                'Telekom/Subskrypcje': 100,
                'Higiena/Zdrowie': 200,
                'Rozrywka': 100,
                'Ubrania': 150,
                'Dom': 110,
                'Nieprzewidziane': 350
            }

            // Zaktualizuj każdą kopertę
            for (const envelope of monthlyEnvelopes) {
                const allocationAmount = allocations[envelope.name] || 0

                if (allocationAmount > 0) {
                    await prisma.envelope.update({
                        where: { id: envelope.id },
                        data: {
                            // Ustaw wartość bezpośrednio (nie dodawaj)
                            currentAmount: allocationAmount
                        }
                    })
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Wypłata rozdzielona pomyślnie!'
            })

        } else if (data.type === 'other') {
            // ✅ NOWY TYP: "Inne przychody" - bez automatycznego podziału
            await prisma.transaction.create({
                data: {
                    userId: USER_ID,
                    type: 'income',
                    amount: data.amount,
                    description: data.description || 'Inny przychód',
                    date: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                message: `Przychód ${data.amount} zł został dodany!`
            })

        } else if (data.type === 'bonus') {
            // Zapisz premię
            await prisma.transaction.create({
                data: {
                    userId: USER_ID,
                    type: 'income',
                    amount: data.amount,
                    description: 'Premia kwartalna',
                    date: new Date()
                }
            })

            // Rozdziel na koperty roczne
            const updates = [
                { name: 'Prezenty', amount: data.toGifts },
                { name: 'OC', amount: data.toInsurance },
                { name: 'Święta', amount: data.toHolidays },
                { name: 'Wolne środki (roczne)', amount: data.toFreedom }
            ]

            for (const update of updates) {
                if (update.amount > 0) {
                    const envelope = await prisma.envelope.findFirst({
                        where: {
                            userId: USER_ID,
                            name: update.name,
                            type: 'yearly'
                        }
                    })

                    if (envelope) {
                        await prisma.envelope.update({
                            where: { id: envelope.id },
                            data: {
                                currentAmount: envelope.currentAmount + update.amount
                            }
                        })
                    }
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Premia rozdzielona pomyślnie!'
            })
        }

        return NextResponse.json(
            { error: 'Nieznany typ przychodu' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Income API error details:', error)
        return NextResponse.json(
            {
                error: 'Błąd zapisywania przychodu',
                details: error instanceof Error ? error.message : 'Nieznany błąd'
            },
            { status: 500 }
        )
    }
}