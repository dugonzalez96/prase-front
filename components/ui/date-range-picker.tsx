"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
    const [date, setDate] = useState<DateRange | undefined>(dateRange)

    useEffect(() => {
        setDate(dateRange)
    }, [dateRange])
    

    return (
        <div className="grid gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={`w-[300px] justify-start text-left font-normal ${date?.from ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/yyyy", { locale: es })} - {format(date.to, "dd/MM/yyyy", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "dd/MM/yyyy", { locale: es })
                            )
                        ) : (
                            <span>Seleccionar rango de fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate) => {
                            setDate(newDate)
                            onDateRangeChange(newDate)
                        }}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

