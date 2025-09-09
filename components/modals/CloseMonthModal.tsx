// components/modals/CloseMonthModal.tsx - NAPRAWIONY
'use client'

import { Modal } from '@/components/ui/Modal'
import { useState, useEffect } from 'react'

interface EnvelopeStatus {
    name: string
    icon: string
    current: number
    planned: number
    spent: number
}

interface Props {
    onClose: () => void
    onConfirm: () => void
    surplus?: number
    monthSummary: {
        income: number
        expenses: number
        savings: number
    }
}

export function CloseMonthModal({ onClose, onConfirm, surplus, monthSummary }: Props) {
    const [envelopeStatus, setEnvelopeStatus] = useState<EnvelopeStatus[]>([])
    const [loading, setLoading] = useState(true)

    const currentMonth = new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
    // Użyj surplus jeśli podany, inaczej oblicz z monthSummary
    const balance = surplus !== undefined ? surplus : (monthSummary.income - monthSummary.expenses)

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                const status = data.monthlyEnvelopes?.map((e: EnvelopeStatus) => ({
                    name: e.name,
                    icon: e.icon,
                    current: e.current,
                    planned: e.planned,
                    spent: e.spent
                }))
                setEnvelopeStatus(status || [])
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    return (
        <Modal title={`🔒 Zamknij miesiąc - ${currentMonth}`} onClose={onClose}>
            <div style={{ marginBottom: '20px' }}>
                <p style={{ marginBottom: '16px', color: '#4b5563' }}>
                    Czy na pewno chcesz zamknąć bieżący miesiąc? Spowoduje to:
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#10b981' }}>✓</span>
                        Reset wszystkich kopert miesięcznych do 0 zł
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#10b981' }}>✓</span>
                        {balance > 0
                            ? `Przeniesienie ${balance} zł (bilans miesiąca) do "Wolnych środków (roczne)"`
                            : balance < 0
                                ? `Zapisanie deficytu ${Math.abs(balance)} zł`
                                : 'Bilans miesiąca wynosi 0 zł'}
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#10b981' }}>✓</span>
                        Zapisanie podsumowania miesiąca w historii
                    </li>
                </ul>
            </div>

            {!loading && envelopeStatus.length > 0 && (
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                        Stan kopert (informacyjnie):
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                        {envelopeStatus.map((e, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{e.icon} {e.name}:</span>
                                <span style={{
                                    fontWeight: '500',
                                    color: e.current > 0 ? '#059669' : e.current < 0 ? '#dc2626' : '#6b7280'
                                }}>
                                    {e.current > 0 ? `Zostało ${e.current} zł` :
                                        e.current < 0 ? `Przekroczono o ${Math.abs(e.current)} zł` :
                                            'Wykorzystano w całości'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                backgroundColor: balance >= 0 ? '#d1fae5' : '#fee2e2',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Podsumowanie miesiąca:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Przychody:</span>
                        <span style={{ fontWeight: '600', color: '#059669' }}>+{monthSummary.income} zł</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Wydatki:</span>
                        <span style={{ fontWeight: '600', color: '#dc2626' }}>-{monthSummary.expenses} zł</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid',
                        borderColor: balance >= 0 ? '#86efac' : '#fca5a5',
                        paddingTop: '8px',
                        fontWeight: '600'
                    }}>
                        <span>BILANS (do przeniesienia):</span>
                        <span style={{ color: balance >= 0 ? '#059669' : '#dc2626', fontSize: '16px' }}>
                            {balance >= 0 ? '+' : ''}{balance} zł
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stopa oszczędności:</span>
                        <span style={{ fontWeight: '600', color: '#6366f1' }}>
                            {monthSummary.income > 0 ? Math.round((balance / monthSummary.income) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Anuluj
                </button>
                <button
                    onClick={onConfirm}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    ✓ Zamknij miesiąc
                </button>
            </div>
        </Modal>
    )
}