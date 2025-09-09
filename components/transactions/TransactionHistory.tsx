'use client'

import { useState } from 'react'
import { getCategoryIcon, getCategoryName } from '@/lib/constants/categories'

interface Transaction {
    id: string
    type: string
    amount: number
    description: string
    date: string
    category?: string
    envelope?: {
        name: string
        icon: string
    }
}

interface Props {
    transactions: Transaction[]
}

export function TransactionHistory({ transactions }: Props) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState<string>('')

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'income': return '💰'
            case 'expense': return '💸'
            case 'transfer': return '🔄'
            default: return '📄'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income': return '#059669'
            case 'expense': return '#dc2626'
            case 'transfer': return '#6366f1'
            default: return '#6b7280'
        }
    }

    const handleEdit = async (transactionId: string, currentAmount: number) => {
        if (editingId === transactionId) {
            // Zapisz zmiany
            const newAmount = parseFloat(editAmount)
            if (newAmount >= 0 && newAmount !== currentAmount) {
                try {
                    const response = await fetch(`/api/transactions/${transactionId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: newAmount,
                            reason: newAmount < currentAmount ? 'Zwrot częściowy' : 'Korekta'
                        })
                    })

                    if (response.ok) {
                        window.location.reload()
                    } else {
                        alert('Błąd podczas edycji')
                    }
                } catch (error) {
                    alert('Błąd podczas edycji')
                }
            }
            setEditingId(null)
        } else {
            // Rozpocznij edycję
            setEditingId(transactionId)
            setEditAmount(currentAmount.toString())
        }
    }

    const handleDelete = async (transactionId: string) => {
        if (confirm('Czy na pewno chcesz usunąć tę transakcję?')) {
            try {
                const response = await fetch(`/api/transactions/${transactionId}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    window.location.reload()
                } else {
                    alert('Błąd podczas usuwania')
                }
            } catch (error) {
                alert('Błąd podczas usuwania')
            }
        }
    }

    // Sortuj transakcje po dacie (najnowsze pierwsze)
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Grupuj transakcje po dniach
    const groupedTransactions = sortedTransactions.reduce((groups: any, transaction) => {
        const date = formatDate(transaction.date)
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(transaction)
        return groups
    }, {})

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📜 Historia transakcji
            </h2>

            {Object.keys(groupedTransactions).length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                    Brak transakcji
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(groupedTransactions).map(([date, dayTransactions]: [string, any]) => (
                        <div key={date}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#6b7280',
                                marginBottom: '6px',
                                paddingBottom: '4px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                {date}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {dayTransactions.map((transaction: Transaction) => (
                                    <div
                                        key={transaction.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            <span>{getTypeIcon(transaction.type)}</span>
                                            <div style={{ flex: 1 }}>
                                                <div>
                                                    {/* Wyświetl kategorię jeśli istnieje */}
                                                    {transaction.category && (
                                                        <span style={{
                                                            marginRight: '8px',
                                                            backgroundColor: '#e0e7ff',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            color: '#3730a3'
                                                        }}>
                                                            {getCategoryIcon(transaction.category)} {getCategoryName(transaction.category)}
                                                        </span>
                                                    )}

                                                    {/* Wyświetl kopertę */}
                                                    {transaction.envelope && (
                                                        <span style={{
                                                            marginRight: '8px',
                                                            backgroundColor: '#f0fdf4',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            color: '#14532d'
                                                        }}>
                                                            {transaction.envelope.icon} {transaction.envelope.name}
                                                        </span>
                                                    )}

                                                    {editingId !== transaction.id && (
                                                        <>
                                                            <span style={{ fontWeight: '500' }}>
                                                                {transaction.amount.toLocaleString()} zł
                                                            </span>
                                                            {transaction.description && (
                                                                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                                                                    - {transaction.description}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                                    {formatTime(transaction.date)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {editingId === transaction.id ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        step="0.01"
                                                        style={{
                                                            width: '100px',
                                                            padding: '4px 8px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontSize: '14px'
                                                        }}
                                                        autoFocus
                                                    />
                                                    <span style={{ color: '#6b7280' }}>zł</span>
                                                    <button
                                                        onClick={() => handleEdit(transaction.id, transaction.amount)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                        title="Zapisz"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                        title="Anuluj"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: getTypeColor(transaction.type),
                                                        whiteSpace: 'nowrap',
                                                        minWidth: '80px',
                                                        textAlign: 'right'
                                                    }}>
                                                        {transaction.type === 'income' ? '+' : '-'}
                                                        {transaction.amount.toLocaleString()} zł
                                                    </div>
                                                    {transaction.type === 'expense' && (
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button
                                                                onClick={() => handleEdit(transaction.id, transaction.amount)}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    backgroundColor: '#f3f4f6',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '4px',
                                                                    fontSize: '11px',
                                                                    cursor: 'pointer',
                                                                    color: '#4b5563'
                                                                }}
                                                                title="Edytuj kwotę"
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(transaction.id)}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    backgroundColor: '#fee2e2',
                                                                    border: '1px solid #fecaca',
                                                                    borderRadius: '4px',
                                                                    fontSize: '11px',
                                                                    cursor: 'pointer',
                                                                    color: '#dc2626'
                                                                }}
                                                                title="Usuń transakcję"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}