import { ReactNode } from 'react'

interface Props {
    title: string
    children: ReactNode
    onClose: () => void
}

export function Modal({ title, children, onClose }: Props) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative', // Dodane
                zIndex: 51 // Dodane - wyższy z-index
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            fontSize: '24px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}