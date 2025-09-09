// app/api/transactions/route.ts - NAPRAWIONY
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

const USER_ID = 'default-user'

export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: USER_ID },
            include: {
                envelope: true
            },
            orderBy: { date: 'desc' },
            take: 100 // Ostatnie 100 transakcji
        })

        // Formatuj dane
        const formatted = transactions.map(t => {
            // ✅ NAPRAWKA: poprawne typowanie
            let category: string | undefined = t.category || undefined // Konwersja null na undefined

            // Jeśli nie ma zapisanej kategorii, spróbuj wyprowadzić z opisu
            if (!category && t.description) {
                const desc = t.description.toLowerCase()
                if (desc.includes('transfer: konto wspólne')) {
                    category = 'joint-account'
                } else if (desc.includes('transfer: inwestycje')) {
                    category = 'investments'
                } else if (desc.includes('transfer:')) {
                    category = 'transfers'
                } else if (desc.includes('zamknięcie miesiąca')) {
                    category = 'month-close'
                }
            }

            return {
                id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description,
                date: t.date.toISOString(),
                category, // Może być undefined
                envelope: t.envelope ? {
                    name: t.envelope.name,
                    icon: t.envelope.icon || '📦'
                } : null
            }
        })

        return NextResponse.json(formatted)

    } catch (error) {
        console.error('Transactions API error:', error)
        return NextResponse.json(
            { error: 'Błąd pobierania transakcji' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()

        // Użyj daty z frontendu lub aktualnej z prawidłową godziną
        const transactionDate = data.date ? new Date(data.date) : new Date()

        // Jeśli data przyszła bez godziny, ustaw aktualną godzinę
        if (data.date && !data.date.includes('T')) {
            const now = new Date()
            transactionDate.setHours(now.getHours())
            transactionDate.setMinutes(now.getMinutes())
            transactionDate.setSeconds(now.getSeconds())
        }

        // Utwórz transakcję
        const transaction = await prisma.transaction.create({
            data: {
                userId: USER_ID,
                type: data.type,
                amount: data.amount,
                description: data.description || '',
                date: transactionDate,
                envelopeId: data.envelopeId || null,
                category: data.category || null // ✅ Może być null
            }
        })

        // POPRAWIONA LOGIKA - obsługa wydatków z kopert miesięcznych I rocznych
        if (data.type === 'expense' && data.envelopeId) {
            const envelope = await prisma.envelope.findUnique({
                where: { id: data.envelopeId }
            })

            if (envelope) {
                if (envelope.type === 'monthly') {
                    // KOPERTY MIESIĘCZNE:
                    // currentAmount = ile zostało do wydania
                    // Po wydatku: zmniejsz dostępne środki
                    await prisma.envelope.update({
                        where: { id: data.envelopeId },
                        data: {
                            currentAmount: envelope.currentAmount - data.amount
                            // Może być ujemne (przekroczenie budżetu)
                        }
                    })
                } else if (envelope.type === 'yearly') {
                    // KOPERTY ROCZNE (Wakacje, Wesele, etc.):
                    // currentAmount = ile mamy zebranego/dostępnego
                    // Po wydatku: zmniejsz zebraną kwotę
                    await prisma.envelope.update({
                        where: { id: data.envelopeId },
                        data: {
                            currentAmount: envelope.currentAmount - data.amount
                            // Dla wakacji: 420 - 100 = 320 pozostało
                            // Może być ujemne jeśli wydamy więcej niż zebrano
                        }
                    })
                }
            }
        }

        return NextResponse.json(transaction)

    } catch (error) {
        console.error('Transaction API error:', error)
        return NextResponse.json(
            { error: 'Błąd zapisywania transakcji' },
            { status: 500 }
        )
    }
}