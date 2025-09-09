'use client'

import { useState, useEffect } from 'react'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'

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
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ fontSize: '24px' }}>Ładowanie historii...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Historia transakcji
          </h1>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Powrót do budżetu
          </button>
        </div>
        
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  )
}