// app/page.tsx - ZAKTUALIZOWANY LAYOUT
'use client'

import { useState } from 'react'
import { MainBalance } from '@/components/dashboard/MainBalance'
import { EnvelopeCard } from '@/components/ui/EnvelopeCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { IncomeModal } from '@/components/modals/IncomeModal'
import { ExpenseModal } from '@/components/modals/ExpenseModal'
import { MonthStatus } from '@/components/dashboard/MonthStatus'
import { CloseMonthModal } from '@/components/modals/CloseMonthModal'
import { BonusModal } from '@/components/modals/BonusModal'
import { useDashboard } from '@/lib/hooks/useDashboard'

// KOMPONENT CELÓW OSZCZĘDNOŚCIOWYCH - Wesele + Wakacje
interface SavingsGoal {
    id: string
    name: string
    current: number
    target: number
    monthlyContribution: number
    icon: string
}

const SavingsGoals = ({ goals }: { goals: SavingsGoal[] }) => (
    <div className="bg-white rounded-lg shadow p-4">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            🎯 Cele oszczędnościowe
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map(goal => {
                const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100)
                const monthsLeft = Math.ceil(Math.max(goal.target - goal.current, 0) / goal.monthlyContribution)
                const isCompleted = goal.current >= goal.target

                return (
                    <div key={goal.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>{goal.icon}</span>
                                {goal.name}
                            </h4>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: isCompleted ? '#10b981' : '#059669' }}>
                                {progress}%{isCompleted && ' ✓'}
                            </span>
                        </div>

                        <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '10px', marginBottom: '12px' }}>
                            <div style={{
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                                height: '100%',
                                borderRadius: '9999px',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                            <span>{goal.current.toLocaleString()} / {goal.target.toLocaleString()} zł</span>
                            {!isCompleted && (
                                <span>{monthsLeft === 1 ? '1 miesiąc' : monthsLeft < 5 ? `${monthsLeft} miesiące` : `${monthsLeft} miesięcy`}</span>
                            )}
                            {isCompleted && (
                                <span style={{ color: '#10b981', fontWeight: '600' }}>Cel osiągnięty! 🎉</span>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#9ca3af',
                            backgroundColor: '#f9fafb',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            <span>💳 Miesięczna wpłata: <strong>{goal.monthlyContribution.toLocaleString()} zł</strong></span>
                            {!isCompleted && (
                                <span>Brakuje: <strong>{Math.max(goal.target - goal.current, 0).toLocaleString()} zł</strong></span>
                            )}
                        </div>

                        {isCompleted && goal.current > goal.target && (
                            <div style={{
                                marginTop: '8px',
                                padding: '6px 8px',
                                backgroundColor: '#d1fae5',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#065f46',
                                textAlign: 'center'
                            }}>
                                💰 Nadwyżka: {(goal.current - goal.target).toLocaleString()} zł
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
)

// KOMPONENT STAŁYCH PRZELEWÓW
const AutoTransfers = ({ totalIncome }: { totalIncome: number }) => {
    const hasIncome = totalIncome > 0
    const transfers = [
        { id: 'joint', name: 'Konto wspólne', amount: 1500, icon: '👫', status: hasIncome ? 'completed' : 'scheduled', description: 'Wydatki domowe i mieszkaniowe' },
        { id: 'wesele', name: 'Wesele (cel)', amount: 1000, icon: '💍', status: hasIncome ? 'completed' : 'scheduled', description: 'Oszczędności na wesele' },
        { id: 'vacation', name: 'Wakacje', amount: 420, icon: '✈️', status: hasIncome ? 'completed' : 'scheduled', description: 'Koperta wakacyjna' },
        { id: 'investment', name: 'Inwestycje', amount: 500, icon: '📈', status: hasIncome ? 'completed' : 'scheduled', description: 'Regularne inwestowanie' }
    ]

    const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    💰 Stałe przelewy
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    {totalTransfers.toLocaleString()} zł
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transfers.map(transfer => (
                    <div key={transfer.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: transfer.status === 'completed' ? '#f0fdf4' : '#f9fafb',
                        borderRadius: '4px',
                        fontSize: '13px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '16px' }}>{transfer.icon}</span>
                            <div>
                                <div style={{ fontWeight: '500', marginBottom: '2px' }}>{transfer.name}</div>
                                <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.2' }}>
                                    {transfer.description}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: '600' }}>{transfer.amount.toLocaleString()} zł</span>
                            <span style={{
                                color: transfer.status === 'completed' ? '#10b981' : '#6b7280',
                                fontSize: '14px',
                                minWidth: '16px',
                                textAlign: 'center'
                            }}>
                                {transfer.status === 'completed' ? '✓' : '📅'}
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

export default function HomePage() {
    const { data, loading, refetch } = useDashboard()
    const [showIncomeModal, setShowIncomeModal] = useState(false)
    const [showBonusModal, setShowBonusModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [showCloseMonthModal, setShowCloseMonthModal] = useState(false)

    const calculateDaysLeft = () => {
        const now = new Date()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const daysLeft = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysLeft
    }

    const handleIncomeSave = async (incomeData: {
        amount: number
        toSavings: number
        toVacation: number
        toInvestment: number
        toJoint: number
        forExpenses: number
        description?: string
    }) => {
        try {
            const response = await fetch('/api/income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: incomeData.toSavings === 0 && incomeData.toVacation === 0 &&
                        incomeData.toInvestment === 0 && incomeData.toJoint === 0 ? 'other' : 'salary',
                    ...incomeData
                })
            })

            if (response.ok) {
                refetch()
                const result = await response.json()
                alert(result.message)
            } else {
                alert('Błąd podczas zapisywania')
            }
        } catch (error) {
            alert('Błąd podczas zapisywania')
        }
    }

    const handleBonusSave = async (bonusData: {
        amount: number
        toGifts: number
        toInsurance: number
        toHolidays: number
        toFreedom: number
    }) => {
        try {
            const response = await fetch('/api/income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'bonus',
                    ...bonusData
                })
            })

            if (response.ok) {
                refetch()
                alert('Premia została rozdzielona na koperty roczne!')
            } else {
                alert('Błąd podczas zapisywania')
            }
        } catch (error) {
            alert('Błąd podczas zapisywania')
        }
    }

    const handleExpenseSave = async (expenseData: {
        amount: number
        description: string
        envelopeId: string
        category: string
        date: string
    }) => {
        try {
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'expense',
                    amount: expenseData.amount,
                    description: expenseData.description,
                    envelopeId: expenseData.envelopeId,
                    category: expenseData.category,
                    date: expenseData.date
                })
            })

            refetch()
            alert('Wydatek zapisany!')
        } catch (error) {
            alert('Błąd podczas zapisywania')
        }
    }

    const handleCloseMonth = async () => {
        try {
            const response = await fetch('/api/close-month', {
                method: 'POST',
                cache: 'no-store'
            })

            if (response.ok) {
                const result = await response.json()
                setShowCloseMonthModal(false)

                setTimeout(() => {
                    refetch()
                    window.location.reload()
                }, 500)

                alert(`✅ ${result.message}\n\nPodsumowanie:\n- Przychody: ${result.summary.totalIncome} zł\n- Wydatki: ${result.summary.totalExpenses} zł\n- Niewykorzystane środki: ${result.summary.unusedFunds} zł`)
            } else {
                alert('Błąd podczas zamykania miesiąca')
            }
        } catch (error) {
            alert('Błąd podczas zamykania miesiąca')
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ fontSize: '24px' }}>Ładowanie...</div>
            </div>
        )
    }

    if (!data) {
        return <div>Błąd ładowania danych</div>
    }

    // Przygotuj dane dla celów oszczędnościowych - WESELE + WAKACJE
    const weseLeEnvelope = data.yearlyEnvelopes?.find(e => e.name === 'Wesele')
    const wakacjeEnvelope = data.yearlyEnvelopes?.find(e => e.name === 'Wakacje')

    const savingsGoals: SavingsGoal[] = []
    if (weseLeEnvelope) {
        savingsGoals.push({
            id: 'wesele',
            name: 'Wesele',
            current: weseLeEnvelope.current,
            target: weseLeEnvelope.planned,
            monthlyContribution: 1000,
            icon: '💑'
        })
    }
    if (wakacjeEnvelope) {
        savingsGoals.push({
            id: 'wakacje',
            name: 'Wakacje',
            current: wakacjeEnvelope.current,
            target: wakacjeEnvelope.planned,
            monthlyContribution: 420,
            icon: '✈️'
        })
    }

    // Koperty roczne BEZ Wesela i Wakacji
    const filteredYearlyEnvelopes = data.yearlyEnvelopes?.filter(e =>
        e.name !== 'Wesele' && e.name !== 'Wakacje'
    ) || []

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px' }}>
                {/* NAGŁÓWEK Z PRZYCISKAMI */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h1 className="text-3xl font-bold text-gray-900">💰 Mój Budżet</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => window.location.href = '/analytics'}
                            style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                        >
                            📊 Analizy
                        </button>
                        <button
                            onClick={() => window.location.href = '/archive'}
                            style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                        >
                            📅 Archiwum
                        </button>
                        <button
                            onClick={() => window.location.href = '/history'}
                            style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                        >
                            📋 Historia
                        </button>
                    </div>
                </div>

                {/* GÓRNY RZĄD - saldo, status, akcje */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <MainBalance balance={data.balance || 0} />
                    <MonthStatus
                        totalIncome={data.totalIncome || 0}
                        totalExpenses={data.totalExpenses || 0}
                        daysLeft={calculateDaysLeft()}
                        onCloseMonth={() => setShowCloseMonthModal(true)}
                    />
                    <QuickActions
                        onAddIncome={() => setShowIncomeModal(true)}
                        onAddExpense={() => setShowExpenseModal(true)}
                    />
                </div>

                {/* GŁÓWNY LAYOUT - 3 KOLUMNY */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {/* LEWA - koperty miesięczne */}
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                            📅 Koperty miesięczne
                        </h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {data.monthlyEnvelopes?.map((envelope) => (
                                <EnvelopeCard key={`${envelope.id}-${envelope.current}`} {...envelope} type="monthly" />
                            ))}
                        </div>
                    </div>

                    {/* ŚRODEK - cele oszczędnościowe + stałe przelewy */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {savingsGoals.length > 0 && <SavingsGoals goals={savingsGoals} />}
                        <AutoTransfers totalIncome={data.totalIncome || 0} />
                    </div>

                    {/* PRAWA - koperty roczne (bez Wesela i Wakacji) */}
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                            📆 Koperty roczne
                        </h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {filteredYearlyEnvelopes.map((envelope) => (
                                <EnvelopeCard key={envelope.id} {...envelope} type="yearly" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAŁY */}
            {showIncomeModal && (
                <IncomeModal
                    onClose={() => setShowIncomeModal(false)}
                    onSave={handleIncomeSave}
                    onSwitchToBonus={() => { setShowIncomeModal(false); setShowBonusModal(true) }}
                />
            )}
            {showBonusModal && (
                <BonusModal onClose={() => setShowBonusModal(false)} onSave={handleBonusSave} />
            )}
            {showExpenseModal && (
                <ExpenseModal
                    onClose={() => setShowExpenseModal(false)}
                    onSave={handleExpenseSave}
                    envelopes={[
                        ...(data.monthlyEnvelopes?.map(e => ({
                            id: e.id,
                            name: e.name,
                            icon: e.icon,
                            type: 'monthly'
                        })) || []),
                        ...(data.yearlyEnvelopes?.map(e => ({
                            id: e.id,
                            name: e.name,
                            icon: e.icon,
                            type: 'yearly'
                        })) || [])
                    ]}
                />
            )}
            {showCloseMonthModal && (
                <CloseMonthModal
                    onClose={() => setShowCloseMonthModal(false)}
                    onConfirm={handleCloseMonth}
                    monthSummary={{
                        income: data.totalIncome || 0,
                        expenses: data.totalExpenses || 0,
                        savings: (data.totalIncome || 0) - (data.totalExpenses || 0)
                    }}
                />
            )}
        </div>
    )
}