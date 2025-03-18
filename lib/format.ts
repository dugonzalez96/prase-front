/**
 * Formatea un número como moneda en pesos mexicanos
 * @param amount - Cantidad a formatear
 * @param options - Opciones adicionales de formato
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (
    amount: number,
    options: {
        /**
         * Si es true, muestra decimales. Por defecto es true
         */
        showDecimals?: boolean;
        /**
         * Si es true, muestra el símbolo de la moneda. Por defecto es true
         */
        showSymbol?: boolean;
        /**
         * Número de decimales a mostrar. Por defecto es 2
         */
        decimals?: number;
        /**
         * Si es true, muestra separadores de miles. Por defecto es true
         */
        showSeparators?: boolean;
    } = {}
): string => {
    const {
        showDecimals = true,
        showSymbol = true,
        decimals = 2,
        showSeparators = true,
    } = options;

    try {
        // Manejo de números negativos
        const isNegative = amount < 0;
        const absoluteAmount = Math.abs(amount);

        // Configuración del formateador
        const formatter = new Intl.NumberFormat('es-MX', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: 'MXN',
            minimumFractionDigits: showDecimals ? decimals : 0,
            maximumFractionDigits: showDecimals ? decimals : 0,
            useGrouping: showSeparators, // Esto controla los separadores de miles
        });

        // Formatear el número
        let formattedAmount = formatter.format(absoluteAmount);

        // Remover el símbolo de la moneda si no se requiere
        if (!showSymbol) {
            formattedAmount = formattedAmount.replace(/[^\d.,]/g, '');
        }

        // Agregar el signo negativo si es necesario
        return isNegative ? `-${formattedAmount}` : formattedAmount;
    } catch (error) {
        console.error('Error al formatear moneda:', error);
        return `$${amount.toFixed(decimals)}`;
    }
};

/**
 * Formatea un número como cantidad
 * @param number - Número a formatear
 * @param decimals - Número de decimales
 * @returns Cadena formateada
 */
export const formatNumber = (
    number: number,
    decimals = 0
): string => {
    try {
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);
    } catch (error) {
        console.error('Error al formatear número:', error);
        return number.toFixed(decimals);
    }
};

/**
 * Formatea un número como porcentaje
 * @param number - Número a formatear (0-100)
 * @param decimals - Número de decimales
 * @returns Cadena formateada con símbolo de porcentaje
 */
export const formatPercentage = (
    number: number,
    decimals = 0
): string => {
    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number / 100);
    } catch (error) {
        console.error('Error al formatear porcentaje:', error);
        return `${number.toFixed(decimals)}%`;
    }
};

// Ejemplos de uso:
/*
formatCurrency(1234.567)               // "$1,234.57"
formatCurrency(1234.567, { showDecimals: false })  // "$1,235"
formatCurrency(1234.567, { showSymbol: false })    // "1,234.57"
formatCurrency(1234.567, { decimals: 3 })          // "$1,234.567"
formatCurrency(-1234.567)              // "-$1,234.57"
formatCurrency(1234.567, { showSeparators: false }) // "$1234.57"
 
formatNumber(1234.567)       // "1,235"
formatNumber(1234.567, 2)    // "1,234.57"
 
formatPercentage(15.5)       // "15.5%"
formatPercentage(15.5, 2)    // "15.50%"
*/

// Validadores de formato
export const isValidCurrency = (value: string): boolean => {
    const currencyRegex = /^\$?\d{1,3}(,\d{3})*(\.\d{1,2})?$/;
    return currencyRegex.test(value);
};

export const isValidPercentage = (value: string): boolean => {
    const percentageRegex = /^-?\d+(\.\d+)?%?$/;
    return percentageRegex.test(value);
};

// Parseadores
export const parseCurrency = (value: string): number => {
    try {
        return Number(value.replace(/[^0-9.-]+/g, ''));
    } catch {
        return 0;
    }
};

export const parsePercentage = (value: string): number => {
    try {
        return Number(value.replace('%', '')) / 100;
    } catch {
        return 0;
    }
};