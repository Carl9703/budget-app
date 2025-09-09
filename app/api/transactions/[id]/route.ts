// app/api/transactions/[id]/route.ts - NAPRAWIONY dla Next.js 15
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

const USER_ID = 'default-user'

// GET - pobierz pojedynczą transakcję
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: params.id,
                userId: USER_ID
            },
            include: {
                envelope: true
            }
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transakcja nie znaleziona' },
                { status: 404 }
            )
        }

        return NextResponse.json(transaction)
    } catch (error) {
        console.error('GET transaction error:', error)
        return NextResponse.json(
            { error: 'Błąd pobierania transakcji' },
            { status: 500 }
        )
    }
}

// PATCH - edytuj transakcję (obsługa zwrotów i zwiększenia kwoty)
export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const data = await request.json()

        // Pobierz oryginalną transakcję
        const originalTransaction = await prisma.transaction.findUnique({
            where: {
                id: params.id,
                userId: USER_ID
            }
        })

        if (!originalTransaction) {
            return NextResponse.json(
                { error: 'Transakcja nie znaleziona' },
                { status: 404 }
            )
        }

        // POPRAWIONA KALKULACJA różnicy kwoty
        const oldAmount = originalTransaction.amount
        const newAmount = data.amount
        const amountDifference = oldAmount - newAmount

        // Przykłady:
        // oldAmount=120, newAmount=50 → amountDifference=70 (zwrot)
        // oldAmount=120, newAmount=150 → amountDifference=-30 (dodatkowy wydatek)

        // Zaktualizuj transakcję
        const updatedTransaction = await prisma.transaction.update({
            where: { id: params.id },
            data: {
                amount: newAmount,
                description: data.description || originalTransaction.description
            }
        })

        // Jeśli to wydatek z kopertą, zaktualizuj stan koperty
        if (originalTransaction.type === 'expense' && originalTransaction.envelopeId) {
            const envelope = await prisma.envelope.findUnique({
                where: { id: originalTransaction.envelopeId }
            })

            if (envelope) {
                let newCurrentAmount = envelope.currentAmount

                if (envelope.type === 'monthly') {
                    // KOPERTY MIESIĘCZNE:
                    // currentAmount = ile zostało w kopercie
                    // Dodatnia różnica = zwrot (dodaj do koperty)
                    // Ujemna różnica = dodatkowy wydatek (odejmij od koperty)
                    newCurrentAmount = envelope.currentAmount + amountDifference

                } else if (envelope.type === 'yearly') {
                    // KOPERTY ROCZNE:
                    // currentAmount = ile zebraliśmy/wydano
                    // Logika podobna - różnica wpływa na stan koperty
                    newCurrentAmount = envelope.currentAmount + amountDifference
                }

                await prisma.envelope.update({
                    where: { id: originalTransaction.envelopeId },
                    data: {
                        currentAmount: newCurrentAmount
                        // UWAGA: Może być ujemne (przekroczenie budżetu)
                    }
                })
            }
        }

        return NextResponse.json(updatedTransaction)

    } catch (error) {
        console.error('Transaction update error:', error)
        return NextResponse.json(
            { error: 'Błąd aktualizacji transakcji' },
            { status: 500 }
        )
    }
}

// DELETE - usuń transakcję
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: params.id,
                userId: USER_ID
            }
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transakcja nie znaleziona' },
                { status: 404 }
            )
        }

        // Jeśli to był wydatek, przywróć całą kwotę do koperty
        if (transaction.type === 'expense' && transaction.envelopeId) {
            const envelope = await prisma.envelope.findUnique({
                where: { id: transaction.envelopeId }
            })

            if (envelope) {
                await prisma.envelope.update({
                    where: { id: transaction.envelopeId },
                    data: {
                        // PRZYWRÓĆ PEŁNĄ KWOTĘ (dodaj z powrotem)
                        currentAmount: envelope.currentAmount + transaction.amount
                        // Dla miesięcznych: zwiększ dostępne środki
                        // Dla rocznych: zmniejsz wydane środki
                    }
                })
            }
        }

        // Usuń transakcję
        await prisma.transaction.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
            message: 'Transakcja została usunięta'
        })

    } catch (error) {
        console.error('Transaction delete error:', error)
        return NextResponse.json(
            { error: 'Błąd usuwania transakcji' },
            { status: 500 }
        )
    }
}