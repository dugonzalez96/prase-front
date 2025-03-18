export const formatNumber = (value: number | string) => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX').format(number);
}