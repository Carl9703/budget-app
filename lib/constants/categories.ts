// lib/constants/categories.ts

export interface Category {
    id: string
    name: string
    icon: string
    defaultEnvelope: string
    type: 'monthly' | 'yearly'
}

// Definicja wszystkich kategorii wydatków
export const EXPENSE_CATEGORIES: Category[] = [
    // JEDZENIE
    { id: 'groceries', name: 'Zakupy spożywcze', icon: '🛒', defaultEnvelope: 'Jedzenie', type: 'monthly' },
    { id: 'restaurants', name: 'Restauracje', icon: '🍕', defaultEnvelope: 'Jedzenie', type: 'monthly' },

    // TRANSPORT
    { id: 'fuel', name: 'Paliwo', icon: '⛽', defaultEnvelope: 'Transport', type: 'monthly' },
    { id: 'car-service', name: 'Serwis auta', icon: '🔧', defaultEnvelope: 'Transport', type: 'monthly' },
    { id: 'public-transport', name: 'Komunikacja miejska', icon: '🚌', defaultEnvelope: 'Transport', type: 'monthly' },
    { id: 'parking', name: 'Parking', icon: '🅿️', defaultEnvelope: 'Transport', type: 'monthly' },

    // TELEKOM
    { id: 'phone', name: 'Telefon', icon: '📱', defaultEnvelope: 'Telekom/Subskrypcje', type: 'monthly' },
    { id: 'subscriptions', name: 'Subskrypcje', icon: '📺', defaultEnvelope: 'Telekom/Subskrypcje', type: 'monthly' },

    // ZDROWIE
    { id: 'pharmacy', name: 'Apteka', icon: '💊', defaultEnvelope: 'Higiena/Zdrowie', type: 'monthly' },
    { id: 'doctor', name: 'Lekarz', icon: '👨‍⚕️', defaultEnvelope: 'Higiena/Zdrowie', type: 'monthly' },
    { id: 'drugstore', name: 'Drogeria', icon: '🧴', defaultEnvelope: 'Higiena/Zdrowie', type: 'monthly' },
    { id: 'hairdresser', name: 'Fryzjer', icon: '💇', defaultEnvelope: 'Higiena/Zdrowie', type: 'monthly' },

    // ROZRYWKA
    { id: 'cinema', name: 'Kino', icon: '🎬', defaultEnvelope: 'Rozrywka', type: 'monthly' },
    { id: 'hobby', name: 'Hobby', icon: '🎮', defaultEnvelope: 'Rozrywka', type: 'monthly' },
    { id: 'sport', name: 'Sport', icon: '⚽', defaultEnvelope: 'Rozrywka', type: 'monthly' },
    { id: 'books', name: 'Książki', icon: '📚', defaultEnvelope: 'Rozrywka', type: 'monthly' },

    // UBRANIA
    { id: 'clothes', name: 'Odzież', icon: '👕', defaultEnvelope: 'Ubrania', type: 'monthly' },
    { id: 'shoes', name: 'Obuwie', icon: '👟', defaultEnvelope: 'Ubrania', type: 'monthly' },

    // DOM
    { id: 'home-equipment', name: 'Wyposażenie', icon: '🏠', defaultEnvelope: 'Dom', type: 'monthly' },
    { id: 'repairs', name: 'Naprawy', icon: '🔨', defaultEnvelope: 'Dom', type: 'monthly' },
    { id: 'appliances', name: 'AGD', icon: '🔌', defaultEnvelope: 'Dom', type: 'monthly' },

    // NIEPRZEWIDZIANE
    { id: 'emergency', name: 'Nagłe wydatki', icon: '⚠️', defaultEnvelope: 'Nieprzewidziane', type: 'monthly' },
    { id: 'other', name: 'Inne', icon: '❓', defaultEnvelope: 'Nieprzewidziane', type: 'monthly' },

    // WAKACJE (roczne)
    { id: 'flights', name: 'Loty', icon: '✈️', defaultEnvelope: 'Wakacje', type: 'yearly' },
    { id: 'hotel', name: 'Hotel', icon: '🏨', defaultEnvelope: 'Wakacje', type: 'yearly' },
    { id: 'vacation-expenses', name: 'Wydatki wakacyjne', icon: '🏖️', defaultEnvelope: 'Wakacje', type: 'yearly' },

    // PREZENTY (roczne)
    { id: 'birthday-gift', name: 'Prezent urodzinowy', icon: '🎁', defaultEnvelope: 'Prezenty', type: 'yearly' },
    { id: 'wedding-gift', name: 'Prezent ślubny', icon: '💑', defaultEnvelope: 'Prezenty', type: 'yearly' },
    { id: 'other-gift', name: 'Prezent inny', icon: '🎀', defaultEnvelope: 'Prezenty', type: 'yearly' },

    // OC (roczne)
    { id: 'insurance', name: 'Ubezpieczenie OC', icon: '📋', defaultEnvelope: 'OC', type: 'yearly' },

    // ŚWIĘTA (roczne)
    { id: 'christmas-gifts', name: 'Prezenty świąteczne', icon: '🎄', defaultEnvelope: 'Święta', type: 'yearly' },
    { id: 'christmas-expenses', name: 'Wydatki świąteczne', icon: '🎅', defaultEnvelope: 'Święta', type: 'yearly' },

    // PRZYCHODY I TRANSFERY (specjalne)
    { id: 'salary', name: 'Wypłata', icon: '💼', defaultEnvelope: '', type: 'monthly' },
    { id: 'bonus', name: 'Premia', icon: '🎁', defaultEnvelope: '', type: 'yearly' },
    { id: 'other-income', name: 'Inne przychody', icon: '💵', defaultEnvelope: '', type: 'monthly' },
    { id: 'joint-account', name: 'Konto wspólne', icon: '👫', defaultEnvelope: '', type: 'monthly' },
    { id: 'investments', name: 'Inwestycje', icon: '📈', defaultEnvelope: '', type: 'monthly' },
    { id: 'wedding-expenses', name: 'Wydatki weselne', icon: '💍', defaultEnvelope: 'Wesele', type: 'yearly' },
]

// Mapowanie kategorii do kopert (dla szybkiego dostępu)
export const CATEGORY_TO_ENVELOPE_MAP: Record<string, string> = EXPENSE_CATEGORIES.reduce(
    (acc, category) => {
        acc[category.id] = category.defaultEnvelope
        return acc
    },
    {} as Record<string, string>
)

// Funkcja do pobrania najpopularniejszych kategorii
export function getPopularCategories(limit: number = 9): Category[] {
    // Pobierz statystyki użycia z localStorage
    if (typeof window !== 'undefined') {
        const usage = JSON.parse(localStorage.getItem('categoryUsage') || '{}')

        // Sortuj kategorie według użycia
        const sorted = [...EXPENSE_CATEGORIES].sort((a, b) => {
            const usageA = usage[a.id] || 0
            const usageB = usage[b.id] || 0
            return usageB - usageA
        })

        return sorted.slice(0, limit)
    }

    // Domyślne najpopularniejsze kategorie
    return EXPENSE_CATEGORIES.slice(0, limit)
}

// Funkcja do zapisania użycia kategorii
export function trackCategoryUsage(categoryId: string): void {
    if (typeof window !== 'undefined') {
        const usage = JSON.parse(localStorage.getItem('categoryUsage') || '{}')
        usage[categoryId] = (usage[categoryId] || 0) + 1
        localStorage.setItem('categoryUsage', JSON.stringify(usage))
    }
}

// Funkcja do znalezienia koperty dla kategorii
export function findEnvelopeForCategory(categoryId: string, envelopes: any[]): string | null {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return null

    const envelope = envelopes.find(e => e.name === category.defaultEnvelope)
    return envelope?.id || null
}

// Funkcja do pobrania danych kategorii
export function getCategoryById(categoryId: string): Category | undefined {
    return EXPENSE_CATEGORIES.find(c => c.id === categoryId)
}

// Funkcja do pobrania ikony kategorii
export function getCategoryIcon(categoryId: string): string {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId)
    return category?.icon || '📦'
}

// Funkcja do pobrania nazwy kategorii
export function getCategoryName(categoryId: string): string {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId)
    return category?.name || 'Inne'
}