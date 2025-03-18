"use client"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowDownCircle, ArrowUpCircle, Calendar, Clock, DollarSign, Eye, Filter, Mail, Scale, X } from "lucide-react"
import { useEffect, useState } from "react"
import { CorteUsuarioModal } from "./CorteDelDiaModal"
import { NuevoCorteDelDiaForm } from "./NuevoCorteDelDiaForm"
interface Usuario {
    UsuarioID: number
    NombreUsuario: string
    Contrasena: string
    EmpleadoID: number
    SucursalID: number | null
}

interface CorteUsuario {
    CorteUsuarioID: number
    FechaCorte: string
    FechaActualizacion: string
    TotalIngresos: string
    TotalIngresosEfectivo: string
    TotalIngresosTarjeta: string
    TotalIngresosTransferencia: string
    TotalEgresos: string
    TotalEgresosEfectivo: string
    TotalEgresosTarjeta: string
    TotalEgresosTransferencia: string
    TotalEfectivo: string
    TotalPagoConTarjeta: string
    TotalTransferencia: string
    SaldoEsperado: string
    SaldoReal: string
    TotalEfectivoCapturado: string
    TotalTarjetaCapturado: string
    TotalTransferenciaCapturado: string
    Diferencia: string
    Observaciones: string
    Estatus: string
    usuarioID: Usuario
    InicioCaja?: {
        InicioCajaID: number
        FechaInicio: string
        FechaActualizacion: string
        MontoInicial: string
        TotalEfectivo: string
        TotalTransferencia: string
        FirmaElectronica: string
        Estatus: string
    }
}

export const TablaCortesDelDia = ({ cortes, usuarios }: { cortes: CorteUsuario[], usuarios: any }) => {
    const [selectedCorte, setSelectedCorte] = useState<CorteUsuario | null>(null)
    const [filteredCortes, setFilteredCortes] = useState<CorteUsuario[]>(cortes)
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [isFiltering, setIsFiltering] = useState(false)

    // Get unique users for the filter dropdown
    const uniqueUsers = Array.from(new Set(cortes.map((corte) => corte.usuarioID.NombreUsuario)))

    // Apply filters when they change
    useEffect(() => {
        let result = [...cortes]

        if (selectedUser) {
            result = result.filter((corte) => corte.usuarioID.NombreUsuario === selectedUser)
        }

        if (startDate) {
            result = result.filter((corte) => new Date(corte.FechaCorte) >= startDate)
        }

        if (endDate) {
            // Add one day to include the end date fully
            const endDatePlusOne = new Date(endDate)
            endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
            result = result.filter((corte) => new Date(corte.FechaCorte) < endDatePlusOne)
        }

        setFilteredCortes(result)
    }, [cortes, selectedUser, startDate, endDate])

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, "h:mm a", { locale: es })
    }

    const resetFilters = () => {
        setSelectedUser("")
        setStartDate(undefined)
        setEndDate(undefined)
        setIsFiltering(false)
    }

    // Función para truncar el correo electrónico
    const truncateEmail = (email: string, maxLength = 15) => {
        if (email.length <= maxLength) return email

        const atIndex = email.indexOf("@")
        if (atIndex <= 0) return email.substring(0, maxLength) + "..."

        const username = email.substring(0, atIndex)
        const domain = email.substring(atIndex)

        if (username.length <= maxLength - 3) return email

        return username.substring(0, maxLength - 3) + "..." + domain
    }

    // Función para obtener el valor absoluto de la diferencia
    const getAbsoluteDifference = (difference: string) => {
        return Math.abs(Number.parseFloat(difference)).toFixed(2)
    }

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex justify-between w-full gap-2 ">
                        <NuevoCorteDelDiaForm usuarios={usuarios} />
                        <div className="flex gap-4">
                            <Button
                                variant={isFiltering ? "default" : "outline"}
                                onClick={() => setIsFiltering(!isFiltering)}
                                className="flex items-center rounded-md"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </Button>
                            {isFiltering && (
                                <Button variant="outline" onClick={resetFilters} className="flex items-center rounded-md">
                                    <X className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {isFiltering && (
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="user-filter">Usuario</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger id="user-filter">
                                        <SelectValue placeholder="Todos los usuarios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los usuarios</SelectItem>
                                        {uniqueUsers.map((user) => (
                                            <SelectItem key={user} value={user}>
                                                {truncateEmail(user)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="start-date">Fecha Inicio</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="start-date" variant="outline" className="w-full justify-start text-left font-normal rounded-md">
                                            {startDate ? format(startDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : "Seleccionar fecha"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label htmlFor="end-date">Fecha Fin</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="end-date" variant="outline" className="w-full justify-start text-left font-normal rounded-md">
                                            {endDate ? format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : "Seleccionar fecha"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCortes.map((corte) => (
                        <Card key={corte.CorteUsuarioID} className="overflow-hidden flex flex-col rounded-lg">
                            <CardHeader className="bg-primary/10 pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle>Corte #{corte.CorteUsuarioID}</CardTitle>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${corte.Estatus === "Cerrado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {corte.Estatus}
                                    </span>
                                </div>
                            </CardHeader>

                            <div className="bg-primary/5 px-6 py-3">
                                <div className="flex items-center mb-2">
                                    <Mail className="w-4 h-4 mr-2 text-primary" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-medium truncate max-w-[180px] inline-block">
                                                    {truncateEmail(corte.usuarioID.NombreUsuario)}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{corte.usuarioID.NombreUsuario}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                        <span>{formatDate(corte.FechaCorte)}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                        <span>{formatTime(corte.FechaCorte)}</span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="pt-4 flex-grow">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="flex items-center text-sm">
                                            <ArrowDownCircle className="w-3 h-3 mr-1 text-green-500" />
                                            <span className="text-muted-foreground">Ingresos:</span>
                                        </p>
                                        <p className="font-medium">{formatCurrency(corte.TotalIngresos)}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center text-sm">
                                            <ArrowUpCircle className="w-3 h-3 mr-1 text-red-500" />
                                            <span className="text-muted-foreground">Egresos:</span>
                                        </p>
                                        <p className="font-medium">{formatCurrency(corte.TotalEgresos)}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center text-sm">
                                            <Scale className="w-3 h-3 mr-1 text-blue-500" />
                                            <span className="text-muted-foreground">Saldo Esperado:</span>
                                        </p>
                                        <p className="font-medium">{formatCurrency(corte.SaldoEsperado)}</p>
                                    </div>
                                    <div>
                                        <p className="flex items-center text-sm">
                                            <Scale className="w-3 h-3 mr-1 text-blue-500" />
                                            <span className="text-muted-foreground">Saldo Real:</span>
                                        </p>
                                        <p className="font-medium">{formatCurrency(corte.SaldoReal)}</p>
                                    </div>
                                </div>

                                {Number.parseFloat(corte.Diferencia) !== 0 && (
                                    <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
                                        <p className="flex items-center text-sm text-red-700">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            <span>Diferencia: {formatCurrency(getAbsoluteDifference(corte.Diferencia))}</span>
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0 mt-auto">
                                <Button className="w-full rounded-md" onClick={() => setSelectedCorte(corte)}>
                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredCortes.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No se encontraron cortes con los filtros seleccionados</p>
                        <Button variant="outline" onClick={resetFilters} className="mt-2">
                            <X className="w-4 h-4 mr-2" />
                            Limpiar Filtros
                        </Button>
                    </div>
                )}
                {selectedCorte && <CorteUsuarioModal corte={selectedCorte} onClose={() => setSelectedCorte(null)} />}
            </div>
        </>
    )
}