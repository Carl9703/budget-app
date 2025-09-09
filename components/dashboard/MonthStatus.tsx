interface Props {
    totalIncome: number
    totalExpenses: number
    daysLeft: number
    onCloseMonth: () => void
}

export function MonthStatus({ totalIncome, totalExpenses, daysLeft, onCloseMonth }: Props) {
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

    const currentMonth = new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    📊 {currentMonth}
                </h2>
                <button
                    onClick={onCloseMonth}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    🔒 Zamknij
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div>
                    <div style={{ color: '#6b7280' }}>Przychody</div>
                    <div style={{ fontWeight: 'bold', color: '#059669' }}>+{totalIncome.toLocaleString()} zł</div>
                </div>
                <div>
                    <div style={{ color: '#6b7280' }}>Wydatki</div>
                    <div style={{ fontWeight: 'bold', color: '#dc2626' }}>-{totalExpenses.toLocaleString()} zł</div>
                </div>
                <div>
                    <div style={{ color: '#6b7280' }}>Bilans</div>
                    <div style={{ fontWeight: 'bold', color: balance >= 0 ? '#059669' : '#dc2626' }}>
                        {balance >= 0 ? '+' : ''}{balance.toLocaleString()} zł
                    </div>
                </div>
                <div>
                    <div style={{ color: '#6b7280' }}>Oszczędności</div>
                    <div style={{ fontWeight: 'bold', color: '#6366f1' }}>{savingsRate}%</div>
                </div>
            </div>

            <div style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#fef3c7',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                📅 Do końca miesiąca: <strong>{daysLeft} dni</strong> • Dzienny budżet: <strong>{Math.round(balance / daysLeft)} zł</strong>
            </div>
        </div>
    )
}