export const formatDateLocal = (dateString: Date) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

export const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

export const formatDateFullTz = (dateString: Date) => {
    const date = fixDate(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
}

export const formatDateTimeFull = (dateString: Date) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'p.m.' : 'a.m.';
    const formattedHour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();

    return `${day} de ${month} de ${year} a las ${formattedHour}:${minutes} ${ampm}`;
}

export const fixDate = (date: Date) => {
    const fechaParsed = new Date(date);
    const offset = fechaParsed.getTimezoneOffset() * 60000;
    return new Date(fechaParsed.getTime() + offset);
}