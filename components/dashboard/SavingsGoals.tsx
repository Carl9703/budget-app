// components/dashboard/SavingsGoals.tsx - KOMPLETNY PLIK
interface SavingsGoal {
    id: string
    name: string
    current: number
    target: number
    monthlyContribution: number
    icon: string
}

interface Props {
    goals: SavingsGoal[]
}

export function SavingsGoals({ goals }: Props) {
    const calculateProgress = (current: number, target: number) => {
        return Math.min(Math.round((current / target) * 100), 100)
    }

    const calculateMonthsRemaining = (current: number, target: number, monthly: number) => {
        const remaining = Math.max(target - current, 0)
        if (monthly <= 0) return 999 // Zabezpieczenie przed dzieleniem przez 0
        return Math.ceil(remaining / monthly)
    }

    // Jeśli brak celów, nie renderuj komponentu
    if (!goals || goals.length === 0) {
        return null
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                🎯 Cele oszczędnościowe
                <span style={{
                    fontSize: '11px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    padding: '2px 6px',
                    borderRadius: '4px'
                }}>
                    {goals.length}
                </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {goals.map((goal) => {
                    const progress = calculateProgress(goal.current, goal.target)
                    const monthsLeft = calculateMonthsRemaining(goal.current, goal.target, goal.monthlyContribution)
                    const isCompleted = goal.current >= goal.target
                    const isOverTarget = goal.current > goal.target

                    return (
                        <div
                            key={goal.id}
                            style={{
                                border: isCompleted ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* NAGŁÓWEK CELU */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <h4 style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    margin: 0,
                                    color: '#111827'
                                }}>
                                    <span style={{ fontSize: '20px' }}>{goal.icon}</span>
                                    {goal.name}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: isCompleted ? '#10b981' : '#059669'
                                    }}>
                                        {progress}%
                                    </span>
                                    {isCompleted && (
                                        <span style={{ fontSize: '16px' }}>✓</span>
                                    )}
                                </div>
                            </div>

                            {/* PASEK POSTĘPU */}
                            <div style={{
                                width: '100%',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '9999px',
                                height: '10px',
                                marginBottom: '12px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                                        height: '100%',
                                        borderRadius: '9999px',
                                        transition: 'width 0.3s ease, background-color 0.3s ease'
                                    }}
                                />
                            </div>

                            {/* KWOTY I CZAS */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '13px',
                                color: '#6b7280',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontWeight: '500' }}>
                                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} zł
                                </span>
                                {!isCompleted && monthsLeft < 999 && (
                                    <span>
                                        {monthsLeft === 1 ? '1 miesiąc' :
                                            monthsLeft < 5 ? `${monthsLeft} miesiące` :
                                                `${monthsLeft} miesięcy`}
                                    </span>
                                )}
                                {isCompleted && (
                                    <span style={{
                                        color: '#10b981',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        🎉 Cel osiągnięty!
                                    </span>
                                )}
                            </div>

                            {/* SZCZEGÓŁY FINANSOWE */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                color: '#9ca3af',
                                backgroundColor: isCompleted ? '#ecfdf5' : '#f9fafb',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isCompleted ? '1px solid #d1fae5' : '1px solid #f3f4f6'
                            }}>
                                <div>
                                    <span>💳 Miesięczna wpłata: </span>
                                    <strong style={{ color: '#111827' }}>
                                        {goal.monthlyContribution.toLocaleString()} zł
                                    </strong>
                                </div>
                                {!isCompleted && (
                                    <div>
                                        <span>Brakuje: </span>
                                        <strong style={{ color: '#dc2626' }}>
                                            {Math.max(goal.target - goal.current, 0).toLocaleString()} zł
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {/* NADWYŻKA (jeśli przekroczono cel) */}
                            {isOverTarget && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#065f46',
                                    textAlign: 'center',
                                    border: '1px solid #a7f3d0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}>
                                    <span>💰</span>
                                    <span>
                                        <strong>Nadwyżka: {(goal.current - goal.target).toLocaleString()} zł</strong>
                                        {' '}(można przeznaczyć na inne cele)
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* PODSUMOWANIE WSZYSTKICH CELÓW */}
            {goals.length > 1 && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#0c4a6e'
                    }}>
                        <span>
                            📈 Łączne oszczędności: <strong>{goals.reduce((sum, g) => sum + g.current, 0).toLocaleString()} zł</strong>
                        </span>
                        <span>
                            🎯 Łączny cel: <strong>{goals.reduce((sum, g) => sum + g.target, 0).toLocaleString()} zł</strong>
                        </span>
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#0369a1',
                        textAlign: 'center',
                        marginTop: '4px'
                    }}>
                        Miesięczne wpłaty razem: <strong>{goals.reduce((sum, g) => sum + g.monthlyContribution, 0).toLocaleString()} zł</strong>
                    </div>
                </div>
            )}
        </div>
    )
}