import { prisma } from '@/lib/utils/prisma'

export async function initializeUserData(userId: string) {
    const existingEnvelopes = await prisma.envelope.findMany({
        where: { userId }
    })

    if (existingEnvelopes.length > 0) {
        return
    }

    // ✅ KOPERTY MIESIĘCZNE - startują z plannedAmount (nie 0)
    // To sprawia, że wyglądają jak 300/300 zł dopóki nie ma wypłaty
    const monthlyEnvelopes = [
        { name: 'Jedzenie', icon: '🍔', plannedAmount: 300, currentAmount: 300 },
        { name: 'Transport', icon: '🚗', plannedAmount: 300, currentAmount: 300 },
        { name: 'Telekom/Subskrypcje', icon: '📱', plannedAmount: 100, currentAmount: 100 },
        { name: 'Higiena/Zdrowie', icon: '💊', plannedAmount: 200, currentAmount: 200 },
        { name: 'Rozrywka', icon: '🎮', plannedAmount: 100, currentAmount: 100 },
        { name: 'Ubrania', icon: '👕', plannedAmount: 150, currentAmount: 150 },
        { name: 'Dom', icon: '🏠', plannedAmount: 110, currentAmount: 110 },
        { name: 'Nieprzewidziane', icon: '⚠️', plannedAmount: 350, currentAmount: 350 },
    ]

    // Koperty roczne - pozostają bez zmian
    const yearlyEnvelopes = [
        { name: 'Wesele', icon: '💍', plannedAmount: 24000, currentAmount: 0 },
        { name: 'Wakacje', icon: '✈️', plannedAmount: 5040, currentAmount: 0 },
        { name: 'Prezenty', icon: '🎁', plannedAmount: 800, currentAmount: 0 },
        { name: 'OC', icon: '📋', plannedAmount: 600, currentAmount: 0 },
        { name: 'Święta', icon: '🎄', plannedAmount: 1000, currentAmount: 0 },
        { name: 'Wolne środki (roczne)', icon: '💰', plannedAmount: 2000, currentAmount: 0 },
    ]

    for (const envelope of monthlyEnvelopes) {
        await prisma.envelope.create({
            data: {
                userId,
                name: envelope.name,
                icon: envelope.icon,
                type: 'monthly',
                plannedAmount: envelope.plannedAmount,
                currentAmount: envelope.currentAmount,
            }
        })
    }

    for (const envelope of yearlyEnvelopes) {
        await prisma.envelope.create({
            data: {
                userId,
                name: envelope.name,
                icon: envelope.icon,
                type: 'yearly',
                plannedAmount: envelope.plannedAmount,
                currentAmount: envelope.currentAmount,
            }
        })
    }
}