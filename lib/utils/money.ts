// lib/utils/money.ts - Uniwersalne funkcje formatowania pieniędzy

/**
 * Zaokrągla kwotę do groszy (usuwa błędy zmiennoprzecinkowe)
 */
export function roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100
}

/**
 * Formatuje kwotę do wyświetlania (z przecinkiem polskim)
 */
export function formatMoney(amount: number, showCurrency: boolean = true): string {
    const rounded = roundToCents(amount)
    const formatted = rounded.toFixed(2).replace('.', ',')
    return showCurrency ? `${formatted} zł` : formatted
}

/**
 * Formatuje kwotę bez miejsc dziesiętnych jeśli to pełne złotówki
 */
export function formatMoneyShort(amount: number, showCurrency: boolean = true): string {
    const rounded = roundToCents(amount)
    const formatted = rounded % 1 === 0
        ? rounded.toString().replace('.', ',')
        : rounded.toFixed(2).replace('.', ',')
    return showCurrency ? `${formatted} zł` : formatted
}

/**
 * Formatuje kwotę z separatorami tysięcy
 */
export function formatMoneyWithSeparators(amount: number, showCurrency: boolean = true): string {
    const rounded = roundToCents(amount)
    const formatted = rounded.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    return showCurrency ? `${formatted} zł` : formatted
}