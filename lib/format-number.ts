export const formatNumber = (value: number | string, decimals: number = 2) => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(number);
}