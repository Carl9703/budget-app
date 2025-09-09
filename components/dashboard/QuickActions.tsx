interface Props {
    onAddIncome: () => void
    onAddExpense: () => void
}

export function QuickActions({ onAddIncome, onAddExpense }: Props) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                ⚡ Szybkie akcje
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                    onClick={onAddIncome}
                    style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    💵 Dodaj przychód
                </button>

                <button
                    onClick={onAddExpense}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    💸 Dodaj wydatek
                </button>
            </div>
        </div>
    )
}