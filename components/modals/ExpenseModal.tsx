'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { EXPENSE_CATEGORIES, getPopularCategories, trackCategoryUsage, findEnvelopeForCategory } from '@/lib/constants/categories'

interface Props {
    onClose: () => void
    onSave: (data: ExpenseData) => void
    envelopes: { id: string; name: string; icon: string; type: string }[]
}

interface ExpenseData {
    amount: number
    description: string
    envelopeId: string
    category: string
    date: string
}

export function ExpenseModal({ onClose, onSave, envelopes }: Props) {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedEnvelope, setSelectedEnvelope] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [showAllCategories, setShowAllCategories] = useState(false)

    const amountInputRef = useRef<HTMLInputElement>(null)

    // Pobierz popularne kategorie
    const popularCategories = getPopularCategories(9)

    // Filtruj kategorie do wyświetlenia
    const displayCategories = showAllCategories ? EXPENSE_CATEGORIES : popularCategories

    useEffect(() => {
        if (amountInputRef.current) {
            amountInputRef.current.focus()
        }
    }, [])

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId)

        // Zapisz użycie kategorii
        trackCategoryUsage(categoryId)

        // Automatycznie wybierz kopertę
        const envelopeId = findEnvelopeForCategory(categoryId, envelopes)
        if (envelopeId) {
            setSelectedEnvelope(envelopeId)
        }
    }

    const handleSubmit = () => {
        if (!amount || !selectedEnvelope || !selectedCategory) {
            alert('Wypełnij wszystkie pola!')
            return
        }

        onSave({
            amount: Number(amount),
            description,
            envelopeId: selectedEnvelope,
            category: selectedCategory,
            date
        })
        onClose()
    }

    // Znajdź wybraną kategorię
    const selectedCategoryData = EXPENSE_CATEGORIES.find(c => c.id === selectedCategory)

    // Grupuj kategorie według typu (miesięczne/roczne)
    const monthlyCategories = displayCategories.filter(c => c.type === 'monthly')
    const yearlyCategories = displayCategories.filter(c => c.type === 'yearly')

    return (
        <Modal title="💸 DODAJ WYDATEK" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* KWOTA */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Kwota
                    </label>
                    <input
                        ref={amountInputRef}
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    />
                </div>

                {/* KATEGORIE */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Wybierz kategorię
                        {!showAllCategories && (
                            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                                (najpopularniejsze)
                            </span>
                        )}
                    </label>

                    {/* Kategorie miesięczne */}
                    {monthlyCategories.length > 0 && (
                        <>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                📅 Miesięczne
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                marginBottom: '12px'
                            }}>
                                {monthlyCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        style={{
                                            padding: '10px 8px',
                                            border: selectedCategory === cat.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            backgroundColor: selectedCategory === cat.id ? '#dbeafe' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                                        <span style={{ fontSize: '11px', textAlign: 'center' }}>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Kategorie roczne */}
                    {yearlyCategories.length > 0 && (
                        <>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                📆 Roczne
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                marginBottom: '12px'
                            }}>
                                {yearlyCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        style={{
                                            padding: '10px 8px',
                                            border: selectedCategory === cat.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            backgroundColor: selectedCategory === cat.id ? '#dbeafe' : '#f9fafb',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                                        <span style={{ fontSize: '11px', textAlign: 'center' }}>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Przycisk pokaż wszystkie */}
                    {!showAllCategories && (
                        <button
                            onClick={() => setShowAllCategories(true)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px dashed #d1d5db',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                color: '#6b7280',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Pokaż wszystkie kategorie →
                        </button>
                    )}
                </div>
                {/* KOPERTA */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Koperta
                        {selectedCategoryData && (
                            <span style={{
                                fontSize: '12px',
                                color: '#059669',
                                marginLeft: '8px',
                                backgroundColor: '#d1fae5',
                                padding: '2px 6px',
                                borderRadius: '4px'
                            }}>
                                ✓ Auto: {selectedCategoryData.defaultEnvelope}
                            </span>
                        )}
                    </label>
                    <select
                        value={selectedEnvelope}
                        onChange={(e) => {
                            console.log('Selected envelope:', e.target.value) // Debug
                            setSelectedEnvelope(e.target.value)
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: selectedEnvelope ? '#f0fdf4' : 'white',
                            cursor: 'pointer',
                            position: 'relative', // Dodane
                            zIndex: 100, // Bardzo wysoki z-index
                            appearance: 'auto' // Przywróć natywny wygląd
                        }}
                    >
                        <option value="">Wybierz kopertę</option>

                        {/* DEBUG - pokaż surowe dane */}
                        <option value="debug" disabled>
                            DEBUG: Wszystkich kopert: {envelopes.length}
                        </option>
                        <option value="debug2" disabled>
                            Miesięcznych: {envelopes.filter(e => e.type === 'monthly').length}
                        </option>
                        <option value="debug3" disabled>
                            Rocznych: {envelopes.filter(e => e.type === 'yearly').length}
                        </option>

                        <optgroup label="📅 Koperty miesięczne">
                            {envelopes.filter(e => e.type === 'monthly').map((env) => {
                                console.log('Monthly envelope:', env) // Debug
                                return (
                                    <option key={env.id} value={env.id}>
                                        {env.icon} {env.name}
                                    </option>
                                )
                            })}
                        </optgroup>
                        <optgroup label="📆 Koperty roczne">
                            {envelopes.filter(e => e.type === 'yearly').map((env) => {
                                console.log('Yearly envelope:', env) // Debug
                                return (
                                    <option key={env.id} value={env.id}>
                                        {env.icon} {env.name}
                                    </option>
                                )
                            })}
                        </optgroup>
                    </select>
                    {/* ROZSZERZONY DEBUG INFO */}
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        Debug: Wybrano {selectedEnvelope || 'brak'} | Dostępne koperty: {envelopes.length}
                        <br />
                        Miesięczne: {envelopes.filter(e => e.type === 'monthly').length} |
                        Roczne: {envelopes.filter(e => e.type === 'yearly').length}
                        <br />
                        Przykład koperty: {envelopes[0] ? `${envelopes[0].name} (${envelopes[0].type})` : 'BRAK'}
                    </div>
                </div>

                {/* OPIS */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Opis (opcjonalnie)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="np. Zakupy w Biedronce"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* DATA */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Data
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            {/* PRZYCISKI */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Anuluj
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!amount || !selectedCategory || !selectedEnvelope}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: amount && selectedCategory && selectedEnvelope ? '#ef4444' : '#d1d5db',
                        color: amount && selectedCategory && selectedEnvelope ? 'white' : '#6b7280',
                        cursor: amount && selectedCategory && selectedEnvelope ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    ✓ Dodaj wydatek
                </button>
            </div>
        </Modal>
    )
}