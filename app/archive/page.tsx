// app/archive/page.tsx
'use client'

import { useState, useEffect } from 'react'

interface Transaction {
    id: string
    type: string
    amount: number
    description: string
    date: string
    envelope?: {
        name: string
        icon: string
    }
    category: string
}

interface MonthData {
    month: string
    year: number
    income: number
    expenses: number
    balance: number
    categories: { [key: string]: number }
    transactions: Transaction[]
}

export default function ArchivePage() {
    const [monthsData, setMonthsData] = useState<MonthData[]>([])
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        fetchMonthsData()
    }, [])

    const fetchMonthsData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/archive', {
                cache: 'no-store'
            })

            if (response.ok) {
                const data = await response.json()
                console.log('Archive data:', data) // Debug
                setMonthsData(data)
                if (data.length > 0) {
                    setSelectedMonth(`${data[0].year}-${data[0].month}`)
                }
            } else {
                const errorText = await response.text()
                setError(`Błąd API: ${response.status} - ${errorText}`)
                console.error('Archive API error:', response.status, errorText)
            }
        } catch (error) {
            console.error('Error fetching archive:', error)
            setError('Błąd połączenia z serwerem')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatMoney = (amount: number) => {
        return amount.toLocaleString('pl-PL') + ' zł'
    }

    const getSelectedMonthData = () => {
        return monthsData.find(m => `${m.year}-${m.month}` === selectedMonth)
    }

    const getTransactionIcon = (type: string) => {
        return type === 'income' ? '💰' : '💸'
    }

    const getTransactionColor = (type: string) => {
        return type === 'income' ? '#059669' : '#dc2626'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <div style={{
                        fontSize: '24px',
                        color: '#6b7280',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <div>Ładowanie archiwum...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        maxWidth: '400px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Błąd ładowania</p>
                        <p style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</p>
                        <button
                            onClick={fetchMonthsData}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Spróbuj ponownie
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <h1 className="text-3xl font-bold text-gray-900">
                        📊 Archiwum miesięcy
                    </h1>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        ← Powrót do budżetu
                    </button>
                </div>

                {monthsData.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '48px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
                        <p style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>
                            Brak danych archiwalnych
                        </p>
                        <p style={{ fontSize: '16px' }}>
                            Archiwum będzie dostępne po zamknięciu pierwszego miesiąca
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
                        {/* Lista miesięcy */}
                        <div>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📅 Miesiące ({monthsData.length})
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {monthsData.map((month) => {
                                    const isSelected = selectedMonth === `${month.year}-${month.month}`
                                    const savingsRate = month.income > 0 ? Math.round((month.balance / month.income) * 100) : 0

                                    return (
                                        <div
                                            key={`${month.year}-${month.month}`}
                                            onClick={() => setSelectedMonth(`${month.year}-${month.month}`)}
                                            style={{
                                                backgroundColor: 'white',
                                                padding: '20px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                                transition: 'all 0.2s',
                                                boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                transform: isSelected ? 'translateY(-2px)' : 'none'
                                            }}
                                        >
                                            <h3 style={{
                                                fontWeight: '700',
                                                marginBottom: '12px',
                                                fontSize: '18px',
                                                color: isSelected ? '#3b82f6' : '#111827'
                                            }}>
                                                {month.month} {month.year}
                                            </h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>Przychody:</span>
                                                    <span style={{ color: '#059669', fontWeight: '600' }}>
                                                        +{formatMoney(month.income)}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#6b7280' }}>Wydatki:</span>
                                                    <span style={{ color: '#dc2626', fontWeight: '600' }}>
                                                        -{formatMoney(month.expenses)}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    paddingTop: '6px',
                                                    borderTop: '1px solid #f3f4f6'
                                                }}>
                                                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Bilans:</span>
                                                    <span style={{
                                                        color: month.balance >= 0 ? '#059669' : '#dc2626',
                                                        fontWeight: '700',
                                                        fontSize: '16px'
                                                    }}>
                                                        {month.balance >= 0 ? '+' : ''}{formatMoney(month.balance)}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginTop: '4px'
                                                }}>
                                                    <span style={{ color: '#6b7280', fontSize: '13px' }}>Oszczędności:</span>
                                                    <span style={{
                                                        fontWeight: '600',
                                                        fontSize: '13px',
                                                        color: savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#f59e0b' : '#dc2626'
                                                    }}>
                                                        {savingsRate}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Szczegóły wybranego miesiąca */}
                        <div>
                            {selectedMonth ? (
                                <div>
                                    {(() => {
                                        const monthData = getSelectedMonthData()
                                        if (!monthData) return null

                                        const savingsRate = monthData.income > 0 ? Math.round((monthData.balance / monthData.income) * 100) : 0

                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {/* Header miesiąca */}
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    padding: '24px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white'
                                                }}>
                                                    <h2 style={{
                                                        fontSize: '24px',
                                                        fontWeight: '700',
                                                        marginBottom: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        📋 {monthData.month} {monthData.year}
                                                    </h2>
                                                    <p style={{ fontSize: '16px', opacity: 0.9 }}>
                                                        Szczegółowe podsumowanie finansowe
                                                    </p>
                                                </div>

                                                {/* Główne statystyki */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                                    gap: '16px'
                                                }}>
                                                    <div style={{
                                                        backgroundColor: 'white',
                                                        padding: '20px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Przychody</div>
                                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                                                            +{formatMoney(monthData.income)}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        backgroundColor: 'white',
                                                        padding: '20px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💸</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Wydatki</div>
                                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                                                            -{formatMoney(monthData.expenses)}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        backgroundColor: 'white',
                                                        padding: '20px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Bilans</div>
                                                        <div style={{
                                                            fontSize: '20px',
                                                            fontWeight: 'bold',
                                                            color: monthData.balance >= 0 ? '#059669' : '#dc2626'
                                                        }}>
                                                            {monthData.balance >= 0 ? '+' : ''}{formatMoney(monthData.balance)}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        backgroundColor: 'white',
                                                        padding: '20px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Oszczędności</div>
                                                        <div style={{
                                                            fontSize: '20px',
                                                            fontWeight: 'bold',
                                                            color: savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#f59e0b' : '#dc2626'
                                                        }}>
                                                            {savingsRate}%
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Wydatki po kategoriach */}
                                                {Object.keys(monthData.categories).length > 0 && (
                                                    <div style={{
                                                        backgroundColor: 'white',
                                                        padding: '24px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb'
                                                    }}>
                                                        <h3 style={{
                                                            fontSize: '18px',
                                                            fontWeight: '600',
                                                            marginBottom: '16px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            🏷️ Wydatki po kategoriach
                                                        </h3>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                                            {Object.entries(monthData.categories)
                                                                .sort(([, a], [, b]) => b - a)
                                                                .map(([category, amount]) => {
                                                                    const percentage = monthData.expenses > 0 ? Math.round((amount / monthData.expenses) * 100) : 0
                                                                    return (
                                                                        <div key={category} style={{
                                                                            padding: '16px',
                                                                            backgroundColor: '#f9fafb',
                                                                            borderRadius: '6px',
                                                                            border: '1px solid #f3f4f6'
                                                                        }}>
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                marginBottom: '8px'
                                                                            }}>
                                                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{category}</span>
                                                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{percentage}%</span>
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '16px',
                                                                                fontWeight: '700',
                                                                                color: '#dc2626'
                                                                            }}>
                                                                                -{formatMoney(amount)}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Historia transakcji */}
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    padding: '24px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <h3 style={{
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        marginBottom: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        📝 Historia transakcji ({monthData.transactions.length})
                                                    </h3>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        maxHeight: '500px',
                                                        overflowY: 'auto',
                                                        paddingRight: '4px'
                                                    }}>
                                                        {monthData.transactions.map((transaction) => (
                                                            <div key={transaction.id} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '12px',
                                                                backgroundColor: '#f9fafb',
                                                                borderRadius: '6px',
                                                                border: '1px solid #f3f4f6',
                                                                fontSize: '14px'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        marginBottom: '4px'
                                                                    }}>
                                                                        <span style={{ fontSize: '18px' }}>
                                                                            {getTransactionIcon(transaction.type)}
                                                                        </span>
                                                                        {transaction.envelope && (
                                                                            <span style={{ fontWeight: '500' }}>
                                                                                {transaction.envelope.icon} {transaction.envelope.name}
                                                                            </span>
                                                                        )}
                                                                        <span style={{ color: '#6b7280' }}>
                                                                            {transaction.description}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        📅 {formatDate(transaction.date)}
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    fontWeight: '700',
                                                                    fontSize: '16px',
                                                                    color: getTransactionColor(transaction.type),
                                                                    whiteSpace: 'nowrap',
                                                                    marginLeft: '16px'
                                                                }}>
                                                                    {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '48px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: '#6b7280',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>👈</div>
                                    <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
                                        Wybierz miesiąc z listy
                                    </p>
                                    <p style={{ fontSize: '14px' }}>
                                        aby zobaczyć szczegółowe podsumowanie finansowe
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}