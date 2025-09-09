// app/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'

interface MonthlyData {
    month: string
    year: number
    income: number
    expenses: number
    savings: number
    categories: { [key: string]: number }
}

interface CategoryRanking {
    name: string
    total: number
}

interface EnvelopeAnalysis {
    name: string
    icon: string
    plannedAmount: number
    efficiency: number
    overrunRate: number
    totalSpent: number
    avgMonthlySpent: number
}

interface GoalAnalysis {
    name: string
    icon: string
    current: number
    target: number
    progress: number
    avgMonthlyContribution: number
    monthsToGoal: number | null
}

interface AnalyticsData {
    monthlyTrends: MonthlyData[]
    categoryRanking: CategoryRanking[]
    envelopeAnalysis: EnvelopeAnalysis[]
    goalAnalysis: GoalAnalysis[]
    monthComparison: {
        incomeChange: number
        expenseChange: number
        savingsChange: number
        incomeChangePercent: number
        expenseChangePercent: number
    } | null
    movingAverages: {
        avgIncome: number
        avgExpenses: number
        avgSavings: number
    }
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Analytics error:', err)
                setLoading(false)
            })
    }, [])

    const formatMoney = (amount: number) => amount.toLocaleString('pl-PL') + ' zł'

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    <div style={{ fontSize: '24px', color: '#6b7280' }}>
                        📊 Ładowanie analiz...
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return <div>Błąd ładowania danych</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <h1 className="text-3xl font-bold text-gray-900">
                        📊 Analizy Budżetowe
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
                            cursor: 'pointer'
                        }}
                    >
                        ← Powrót do budżetu
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* 1. TRENDY MIESIĘCZNE */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📈 Trendy Miesięczne
                        </h2>

                        {/* Prosty wykres słupkowy */}
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.monthlyTrends.length, 6)}, 1fr)`, gap: '16px' }}>
                            {data.monthlyTrends.slice(-6).map((month, index) => {
                                const maxValue = Math.max(...data.monthlyTrends.slice(-6).map(m => Math.max(m.income, m.expenses)))
                                const incomeHeight = (month.income / maxValue) * 100
                                const expenseHeight = (month.expenses / maxValue) * 100
                                const savingsRate = month.income > 0 ? Math.round((month.savings / month.income) * 100) : 0

                                return (
                                    <div key={index} style={{ textAlign: 'center' }}>
                                        <div style={{ height: '120px', display: 'flex', alignItems: 'end', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: '16px',
                                                height: `${incomeHeight}%`,
                                                backgroundColor: '#10b981',
                                                borderRadius: '2px',
                                                minHeight: '4px'
                                            }} title={`Przychody: ${formatMoney(month.income)}`} />
                                            <div style={{
                                                width: '16px',
                                                height: `${expenseHeight}%`,
                                                backgroundColor: '#ef4444',
                                                borderRadius: '2px',
                                                minHeight: '4px'
                                            }} title={`Wydatki: ${formatMoney(month.expenses)}`} />
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '500' }}>
                                            {month.month.slice(0, 3)} {month.year}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: savingsRate >= 20 ? '#059669' : savingsRate >= 10 ? '#f59e0b' : '#dc2626',
                                            fontWeight: '600'
                                        }}>
                                            {savingsRate}%
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                                <span>Przychody</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                                <span>Wydatki</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. RANKING KATEGORII */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏷️ Ranking Kategorii (Łączne Wydatki)
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                            {data.categoryRanking.slice(0, 8).map((category, index) => {
                                const maxTotal = data.categoryRanking[0]?.total || 1
                                const percentage = Math.round((category.total / maxTotal) * 100)

                                return (
                                    <div key={category.name} style={{
                                        padding: '16px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '6px',
                                        border: '1px solid #f3f4f6'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                #{index + 1} {category.name}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{percentage}%</span>
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>
                                            {formatMoney(category.total)}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '4px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                backgroundColor: index === 0 ? '#dc2626' : index === 1 ? '#f59e0b' : '#6b7280',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                        {/* 3. ANALIZY KOPERT */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📦 Analizy Kopert
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.envelopeAnalysis.slice(0, 6).map((envelope) => (
                                    <div key={envelope.name} style={{
                                        padding: '12px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '6px',
                                        border: envelope.overrunRate > 50 ? '1px solid #fecaca' : '1px solid #f3f4f6'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                {envelope.icon} {envelope.name}
                                            </span>
                                            {envelope.overrunRate > 50 && (
                                                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
                                                    ⚠️ PROBLEMATYCZNA
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Efficiency: </span>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: envelope.efficiency > 100 ? '#dc2626' : envelope.efficiency > 80 ? '#f59e0b' : '#059669'
                                                }}>
                                                    {envelope.efficiency}%
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Przekroczenia: </span>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: envelope.overrunRate > 30 ? '#dc2626' : '#6b7280'
                                                }}>
                                                    {envelope.overrunRate}%
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                            Średnio: {formatMoney(envelope.avgMonthlySpent)}/miesiąc
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. CELE I PROGNOZY */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎯 Cele i Prognozy
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {data.goalAnalysis.map((goal) => (
                                    <div key={goal.name} style={{
                                        padding: '16px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '6px',
                                        border: '1px solid #f3f4f6'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                                {goal.icon} {goal.name}
                                            </span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                                                {goal.progress}%
                                            </span>
                                        </div>

                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(goal.progress, 100)}%`,
                                                height: '100%',
                                                backgroundColor: goal.progress >= 100 ? '#10b981' : '#3b82f6',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>

                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                            {formatMoney(goal.current)} / {formatMoney(goal.target)}
                                        </div>

                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                            Średni wkład: {formatMoney(goal.avgMonthlyContribution)}/miesiąc
                                            {goal.monthsToGoal && (
                                                <span style={{ marginLeft: '8px', color: '#059669', fontWeight: '500' }}>
                                                    • Cel za ~{goal.monthsToGoal} miesięcy
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. PORÓWNANIA OKRESOWE */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📊 Porównania Okresowe
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

                            {/* Miesiąc vs miesiąc */}
                            {data.monthComparison && (
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                                        📅 Miesiąc do miesiąca
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Przychody: </span>
                                            <span style={{
                                                fontWeight: '600',
                                                color: data.monthComparison.incomeChange >= 0 ? '#059669' : '#dc2626'
                                            }}>
                                                {data.monthComparison.incomeChange >= 0 ? '+' : ''}{formatMoney(data.monthComparison.incomeChange)}
                                                ({data.monthComparison.incomeChangePercent >= 0 ? '+' : ''}{data.monthComparison.incomeChangePercent}%)
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Wydatki: </span>
                                            <span style={{
                                                fontWeight: '600',
                                                color: data.monthComparison.expenseChange <= 0 ? '#059669' : '#dc2626'
                                            }}>
                                                {data.monthComparison.expenseChange >= 0 ? '+' : ''}{formatMoney(data.monthComparison.expenseChange)}
                                                ({data.monthComparison.expenseChangePercent >= 0 ? '+' : ''}{data.monthComparison.expenseChangePercent}%)
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>Oszczędności: </span>
                                            <span style={{
                                                fontWeight: '600',
                                                color: data.monthComparison.savingsChange >= 0 ? '#059669' : '#dc2626'
                                            }}>
                                                {data.monthComparison.savingsChange >= 0 ? '+' : ''}{formatMoney(data.monthComparison.savingsChange)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Średnie ruchome */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '6px',
                                border: '1px solid #f3f4f6'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                                    📈 Średnie ruchome (3 miesiące)
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Śr. przychody: </span>
                                        <span style={{ fontWeight: '600', color: '#059669' }}>
                                            {formatMoney(data.movingAverages.avgIncome)}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Śr. wydatki: </span>
                                        <span style={{ fontWeight: '600', color: '#dc2626' }}>
                                            {formatMoney(data.movingAverages.avgExpenses)}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Śr. oszczędności: </span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: data.movingAverages.avgSavings >= 0 ? '#059669' : '#dc2626'
                                        }}>
                                            {formatMoney(data.movingAverages.avgSavings)}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #e5e7eb' }}>
                                        <span style={{ color: '#6b7280' }}>Stopa oszczędności: </span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: data.movingAverages.avgIncome > 0 && (data.movingAverages.avgSavings / data.movingAverages.avgIncome) >= 0.2 ? '#059669' : '#f59e0b'
                                        }}>
                                            {data.movingAverages.avgIncome > 0 ? Math.round((data.movingAverages.avgSavings / data.movingAverages.avgIncome) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Prognoza wolnych środków */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #e0f2fe'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0369a1' }}>
                                    🔮 Prognoza (6 miesięcy)
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Wolne środki: </span>
                                        <span style={{ fontWeight: '600', color: '#0369a1' }}>
                                            {formatMoney(data.movingAverages.avgSavings * 6)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                        Przy obecnym tempie oszczędzania
                                    </div>
                                </div>
                            </div>

                            {/* What-if scenario */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '6px',
                                border: '1px solid #dcfce7'
                            }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#059669' }}>
                                    💡 What-if: +200 zł/miesiąc
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Za 6 miesięcy: </span>
                                        <span style={{ fontWeight: '600', color: '#059669' }}>
                                            {formatMoney((data.movingAverages.avgSavings + 200) * 6)}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#6b7280' }}>Różnica: </span>
                                        <span style={{ fontWeight: '600', color: '#059669' }}>
                                            +{formatMoney(200 * 6)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                        Gdybyś oszczędzał więcej
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}