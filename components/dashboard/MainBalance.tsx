import { formatMoney } from '@/lib/utils/money'

interface Props {
    balance: number
}

export function MainBalance({ balance }: Props) {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-100 text-xs">Konto główne</p>
                    <p className="text-2xl font-bold mt-1">{formatMoney(balance)}</p>
                </div>
                <div className="text-3xl opacity-50">💳</div>
            </div>
        </div>
    )
}