import { formatMoney } from '@/lib/utils/money'

interface EnvelopeProps {
    name: string
    icon: string
    spent: number
    planned: number
    current: number
    type: 'monthly' | 'yearly'
}

export function EnvelopeCard({ name, icon, spent, planned, current, type }: EnvelopeProps) {
    // Sprawdź czy to "Wolne środki" - dla nich nie pokazujemy celu
    const isFreedomFunds = name.toLowerCase().includes('wolne środki')

    // Dla miesięcznych: procent wydatków, dla rocznych: procent zebrany
    const percentage = type === 'monthly'
        ? (planned > 0 ? Math.round((spent / planned) * 100) : 0)
        : isFreedomFunds
            ? 100 // Wolne środki zawsze 100% (bez celu)
            : (planned > 0 ? Math.round((current / planned) * 100) : 0)

    // Dla miesięcznych: current, dla rocznych: planned - current (lub brak dla wolnych środków)
    const remaining = Math.round((type === 'monthly' ? current : planned - current) * 100) / 100

    // Sprawdź czy przekroczono budżet (tylko dla miesięcznych)
    const isOverBudget = type === 'monthly' && spent > planned

    const getProgressColor = () => {
        if (type === 'monthly') {
            if (percentage > 100) return '#991b1b' // ciemnoczerwony
            if (percentage >= 90) return '#ef4444' // czerwony
            if (percentage >= 75) return '#f59e0b' // żółty
            if (percentage >= 50) return '#3b82f6' // niebieski
            return '#10b981' // zielony
        } else {
            if (isFreedomFunds) return '#6366f1' // fioletowy dla wolnych środków
            if (percentage >= 100) return '#10b981' // zielony
            if (percentage >= 75) return '#3b82f6' // niebieski
            if (percentage >= 50) return '#f59e0b' // żółty
            return '#ef4444' // czerwony
        }
    }

    return (
        <div style={{
            backgroundColor: 'white',
            border: isOverBudget ? '2px solid #ef4444' : '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            transition: 'box-shadow 0.2s',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>{name}</span>
                </div>
                <span style={{ fontSize: '13px', color: isOverBudget ? '#dc2626' : '#6b7280' }}>
                    {type === 'monthly' ?
                        `${formatMoney(spent, false)}/${formatMoney(planned, false)} zł` :
                        isFreedomFunds ?
                            formatMoney(current) : // Tylko aktualna kwota dla wolnych środków
                            `${formatMoney(current, false)}/${formatMoney(planned, false)} zł`
                    }
                </span>
            </div>

            {/* PASEK POSTĘPU - ukryj dla wolnych środków */}
            {!isFreedomFunds && (
                <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '6px'
                }}>
                    <div style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(),
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                    }} />
                    {/* Dodatkowy pasek dla przekroczenia */}
                    {percentage > 100 && (
                        <div style={{
                            position: 'relative',
                            marginTop: '-6px',
                            width: '100%',
                            height: '6px',
                            backgroundColor: '#991b1b',
                            opacity: 0.3
                        }} />
                    )}
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px'
            }}>
                {!isFreedomFunds && (
                    <span style={{
                        color: isOverBudget ? '#dc2626' : '#6b7280',
                        fontWeight: isOverBudget ? '600' : '400'
                    }}>
                        {percentage}%
                    </span>
                )}

                <span style={{
                    fontWeight: '500',
                    color: type === 'monthly' ?
                        (isOverBudget ? '#dc2626' : (remaining > 0 ? '#059669' : '#6b7280')) :
                        isFreedomFunds ?
                            '#6366f1' : // Fioletowy dla wolnych środków
                            (percentage >= 100 ? '#059669' : '#6b7280'),
                    marginLeft: isFreedomFunds ? 'auto' : '0' // Wyśrodkuj tekst dla wolnych środków
                }}>
                    {type === 'monthly' ?
                        (isOverBudget ?
                            `⚠️ Przekroczono o ${formatMoney(spent - planned)}` :
                            `Zostało: ${formatMoney(remaining)}`) :
                        isFreedomFunds ?
                            `💰 Dostępne środki` : // Specjalny tekst dla wolnych środków
                            (percentage >= 100 ?
                                `Zebrano! +${formatMoney(Math.abs(remaining))}` :
                                `Brakuje: ${formatMoney(Math.abs(remaining))}`)
                    }
                </span>
            </div>
        </div>
    )
}