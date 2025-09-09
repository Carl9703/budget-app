interface Transfer {
    id: string
    name: string
    amount: number
    icon: string
    status: 'completed' | 'pending' | 'scheduled'
    type: 'savings' | 'investment' | 'joint' | 'envelope'
    description?: string
}

interface Props {
    totalIncome: number
}

export function AutoTransfers({ totalIncome }: Props) {
    // Sprawdź czy w tym miesiącu była wypłata
    const hasIncome = totalIncome > 0

    const transfers: Transfer[] = [
        {
            id: 'joint',
            name: 'Konto wspólne',
            amount: 1500,
            icon: '👫',
            status: hasIncome ? 'completed' : 'scheduled',
            type: 'joint',
            description: 'Wydatki domowe i mieszkaniowe'
        },
        {
            id: 'wesele',
            name: 'Wesele (cel)',
            amount: 1000,
            icon: '💍',
            status: hasIncome ? 'completed' : 'scheduled',
            type: 'savings',
            description: 'Oszczędności na wesele'
        },
        {
            id: 'vacation',
            name: 'Wakacje',
            amount: 420,
            icon: '✈️',
            status: hasIncome ? 'completed' : 'scheduled',
            type: 'envelope',
            description: 'Koperta wakacyjna'
        },
        {
            id: 'investment',
            name: 'Inwestycje',
            amount: 500,
            icon: '📈',
            status: hasIncome ? 'completed' : 'scheduled',
            type: 'investment',
            description: 'Regularne inwestowanie'
        }
    ]

    const getStatusColor = (status: Transfer['status']) => {
        switch (status) {
            case 'completed': return '#10b981' // zielony
            case 'pending': return '#f59e0b'   // żółty
            case 'scheduled': return '#6b7280' // szary
        }
    }

    const getStatusIcon = (status: Transfer['status']) => {
        switch (status) {
            case 'completed': return '✓'
            case 'pending': return '⏳'
            case 'scheduled': return '📅'
        }
    }

    const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    💰 Stałe przelewy
                </h3>
                <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                }}>
                    {totalTransfers.toLocaleString()} zł
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transfers.map((transfer) => (
                    <div
                        key={transfer.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: transfer.status === 'completed' ? '#f0fdf4' : '#f9fafb',
                            borderRadius: '4px',
                            fontSize: '13px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '16px' }}>{transfer.icon}</span>
                            <div>
                                <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                                    {transfer.name}
                                </div>
                                {transfer.description && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        lineHeight: '1.2'
                                    }}>
                                        {transfer.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{ fontWeight: '600' }}>
                                {transfer.amount.toLocaleString()} zł
                            </span>
                            <span
                                style={{
                                    color: getStatusColor(transfer.status),
                                    fontSize: '14px',
                                    minWidth: '16px',
                                    textAlign: 'center'
                                }}
                                title={transfer.status === 'completed' ? 'Wykonano' :
                                    transfer.status === 'pending' ? 'W trakcie' : 'Zaplanowano'}
                            >
                                {getStatusIcon(transfer.status)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {!hasIncome && (
                <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#92400e',
                    textAlign: 'center'
                }}>
                    💡 Przelewy zostaną wykonane po dodaniu wypłaty
                </div>
            )}
        </div>
    )
}
