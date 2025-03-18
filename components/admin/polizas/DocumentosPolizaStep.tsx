"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    File,
    Upload,
    X,
    Eye
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import Loading from "@/app/(protected)/loading"

const TIPOS_ARCHIVO_PERMITIDOS = ["application/pdf", "image/jpeg", "image/jpg"]
const TAMANO_MAXIMO = 5 * 1024 * 1024

const documentosSchema = z.object({
    ine: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La INE es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    tarjetaCirculacion: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La tarjeta de circulación es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    cartaFactura: z.custom<FileList>()
        .optional(),
    comprobanteDomicilio: z.custom<FileList>()
        .optional(),
    fotoFrontal: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La foto frontal es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    fotoTrasera: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La foto trasera es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    fotoLateralIzquierda: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La foto lateral izquierda es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    fotoLateralDerecha: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La foto lateral derecha es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
    fotoVIN: z.custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La foto del VIN es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos PDF o JPEG"
        ),
})

type DocumentosFormData = z.infer<typeof documentosSchema>

interface ArchivosBase64 {
    ine?: string
    tarjetaCirculacion?: string
    cartaFactura?: string
    comprobanteDomicilio?: string
    fotoFrontal?: string
    fotoTrasera?: string
    fotoLateralIzquierda?: string
    fotoLateralDerecha?: string
    fotoVIN?: string
}

interface DocumentosPolizaStepProps {
    alSubmit: (documentos: ArchivosBase64) => void
}

interface PrevisualizacionArchivoProps {
    archivo: File
    onEliminar: () => void
}

const PrevisualizacionArchivo = ({ archivo, onEliminar }: PrevisualizacionArchivoProps) => {
    const esImagen = archivo.type.startsWith('image/')
    const esPDF = archivo.type === 'application/pdf'
    const vistaPrevia = esImagen ? URL.createObjectURL(archivo) : undefined

    if (vistaPrevia) {
        window.addEventListener('beforeunload', () => URL.revokeObjectURL(vistaPrevia))
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <File className="h-4 w-4" />
                <span className="text-sm truncate flex-1">{archivo.name}</span>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        {esImagen && vistaPrevia && (
                            <img
                                src={vistaPrevia}
                                alt="Vista previa"
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        )}
                        {esPDF && (
                            <iframe
                                src={URL.createObjectURL(archivo)}
                                className="w-full h-[80vh]"
                                title="Vista previa PDF"
                            />
                        )}
                    </DialogContent>
                </Dialog>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onEliminar}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            {esImagen && vistaPrevia && (
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="w-full h-full object-contain"
                    />
                </div>
            )}
            {esPDF && (
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <File className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
            )}
        </div>
    )
}

export const DocumentosPolizaStep = ({ alSubmit }: DocumentosPolizaStepProps) => {
    const [cargando, setCargando] = useState(false)

    const form = useForm<DocumentosFormData>({
        resolver: zodResolver(documentosSchema),
    })

    const manejarSubmit = async (datos: DocumentosFormData) => {
        setCargando(true)
        try {
            const camposArchivo = {
                ine: datos.ine,
                tarjetaCirculacion: datos.tarjetaCirculacion,
                cartaFactura: datos.cartaFactura,
                comprobanteDomicilio: datos.comprobanteDomicilio,
                fotoFrontal: datos.fotoFrontal,
                fotoTrasera: datos.fotoTrasera,
                fotoLateralIzquierda: datos.fotoLateralIzquierda,
                fotoLateralDerecha: datos.fotoLateralDerecha,
                fotoVIN: datos.fotoVIN
            }

            const archivosBase64: Record<string, string> = {}

            await Promise.all(
                Object.entries(camposArchivo).map(async ([nombre, archivos]) => {
                    if (archivos?.[0]) {
                        const base64 = await convertirArchivoABase64(archivos[0])
                        archivosBase64[nombre] = base64
                    }
                })
            )

            alSubmit(archivosBase64)
        } finally {
            setCargando(false)
        }
    }

    const convertirArchivoABase64 = (archivo: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const lector = new FileReader()
            lector.readAsDataURL(archivo)
            lector.onload = () => resolve(lector.result as string)
            lector.onerror = (error) => reject(error)
        })
    }

    return (
        <>
            {cargando && <Loading />}
            <Card>
                <CardHeader>
                    <CardTitle>Documentación</CardTitle>
                    <CardDescription>
                        Sube los documentos requeridos para activar la póliza
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(manejarSubmit)} className="space-y-6">
                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="ine"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>INE / IFE * (PDF o JPEG)</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...field}
                                                    />
                                                    {value?.[0] && (
                                                        <PrevisualizacionArchivo
                                                            archivo={value[0]}
                                                            onEliminar={() => onChange(new DataTransfer().files)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tarjetaCirculacion"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Tarjeta de Circulación * (PDF o JPEG)</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...field}
                                                    />
                                                    {value?.[0] && (
                                                        <PrevisualizacionArchivo
                                                            archivo={value[0]}
                                                            onEliminar={() => onChange(new DataTransfer().files)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cartaFactura"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Carta Factura (Opcional - PDF o JPEG)</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...field}
                                                    />
                                                    {value?.[0] && (
                                                        <PrevisualizacionArchivo
                                                            archivo={value[0]}
                                                            onEliminar={() => onChange(new DataTransfer().files)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="comprobanteDomicilio"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Comprobante de Domicilio (Opcional - PDF o JPEG)</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...field}
                                                    />
                                                    {value?.[0] && (
                                                        <PrevisualizacionArchivo
                                                            archivo={value[0]}
                                                            onEliminar={() => onChange(new DataTransfer().files)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Fotografías del Vehículo *</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fotoFrontal"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Frontal</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg"
                                                                onChange={(e) => onChange(e.target.files)}
                                                                {...field}
                                                            />
                                                            {value?.[0] && (
                                                                <PrevisualizacionArchivo
                                                                    archivo={value[0]}
                                                                    onEliminar={() => onChange(new DataTransfer().files)}
                                                                />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="fotoTrasera"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Trasera</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg"
                                                                onChange={(e) => onChange(e.target.files)}
                                                                {...field}
                                                            />
                                                            {value?.[0] && (
                                                                <PrevisualizacionArchivo
                                                                    archivo={value[0]}
                                                                    onEliminar={() => onChange(new DataTransfer().files)}
                                                                />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="fotoLateralIzquierda"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Lateral Izquierda</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg"
                                                                onChange={(e) => onChange(e.target.files)}
                                                                {...field}
                                                            />
                                                            {value?.[0] && (
                                                                <PrevisualizacionArchivo
                                                                    archivo={value[0]}
                                                                    onEliminar={() => onChange(new DataTransfer().files)}
                                                                />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="fotoLateralDerecha"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Lateral Derecha</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg"
                                                                onChange={(e) => onChange(e.target.files)}
                                                                {...field}
                                                            />
                                                            {value?.[0] && (
                                                                <PrevisualizacionArchivo
                                                                    archivo={value[0]}
                                                                    onEliminar={() => onChange(new DataTransfer().files)}
                                                                />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="fotoVIN"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Fotografía del VIN (Número de Serie) *</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...field}
                                                    />
                                                    {value?.[0] && (
                                                        <PrevisualizacionArchivo
                                                            archivo={value[0]}
                                                            onEliminar={() => onChange(new DataTransfer().files)}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={cargando}>
                                <Upload className="mr-2 h-4 w-4" />
                                {cargando ? "Subiendo..." : "Subir Documentos"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
};