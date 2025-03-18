'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    login,
    getAnios,
    getMarcasPorAnio,
    getModelosPorAnioMarca,
    getVersionesPorAnioMarcaModelo,
    getPrecioVersionPorClave
} from "@/actions/LibroAzul";
import {
    iGetAnios,
    iGetMarcasPorAnio,
    iGetModelosPorAnioMarca,
    iGetPrecioVersionPorClave,
    iGetVersionesPorAnioMarcaModelo
} from "@/interfaces/LibroAzul";
import { useState } from "react"
import { getAniosSchema, getMarcasPorAnioSchema, getModelosPorAnioMarcaSchema, getPrecioVersionPorClaveSchema, getVersionesPorAnioMarcaModeloSchema } from "@/schemas/libroAzulSchema"
import { Loader2, Calendar, Car, Truck, Cog, RefreshCw, User, Lock, LogIn } from "lucide-react"

export default function LibroAzulForm() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [step, setStep] = useState(0)
    const [years, setYears] = useState<iGetAnios[]>([])
    const [brands, setBrands] = useState<iGetMarcasPorAnio[]>([])
    const [models, setModels] = useState<iGetModelosPorAnioMarca[]>([])
    const [versions, setVersions] = useState<iGetVersionesPorAnioMarcaModelo[]>([])
    const [selectedYear, setSelectedYear] = useState<iGetAnios | null>(null)
    const [selectedBrand, setSelectedBrand] = useState<iGetMarcasPorAnio | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedModel, setSelectedModel] = useState<iGetModelosPorAnioMarca | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedVersion, setSelectedVersion] = useState<iGetVersionesPorAnioMarcaModelo | null>(null)
    const [price, setPrice] = useState<iGetPrecioVersionPorClave | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            const key = await login(username, password)
            // const key = "MCM0MjE1MTcvMTAzMjI="
            if (key) {
                setApiKey(key)
                setIsLoggedIn(true)

                await loadYears(key)
            } else {
                setError('Credenciales incorrectas')
            }
        } catch (error) {
            setError('Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    const loadYears = async (key: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // const yearsData = await getAnios(key)

            const yearsData = await getAnios(key)

            if (yearsData) {
                const validatedYears = getAniosSchema.parse(yearsData)
                setYears(validatedYears)
                setStep(1)
            } else {
                setError('No se pudieron cargar los años')
            }
        } catch (error) {
            setError('Error al cargar los años')
            setIsLoggedIn(false)
            setApiKey(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handleYearSelect = async (yearClave: string) => {

        if (!apiKey) return
        const year = years.find(y => y.Clave === yearClave)

        if (!year) return
        setSelectedYear(year)
        setIsLoading(true)
        setError(null)

        try {
            const brandsData = await getMarcasPorAnio(apiKey, year)

            if (brandsData) {
                const validatedBrands = getMarcasPorAnioSchema.parse(brandsData)
                setBrands(validatedBrands)
                setStep(2)
            } else {
                setError('No se pudieron cargar las marcas :(')
            }
        } catch (error) {
            setError('Error al cargar las marcas')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBrandSelect = async (brandClave: string) => {
        if (!apiKey || !selectedYear) return
        const brand = brands.find(b => b.Clave === brandClave)
        if (!brand) return
        setSelectedBrand(brand)
        setIsLoading(true)
        setError(null)
        try {
            const modelsData = await getModelosPorAnioMarca(apiKey, selectedYear.Clave, brand)
            if (modelsData) {
                const validatedModels = getModelosPorAnioMarcaSchema.parse(modelsData)
                setModels(validatedModels)
                setStep(3)
            } else {
                setError('No se pudieron cargar los modelos')
            }
        } catch (error) {
            setError('Error al cargar los modelos')
        } finally {
            setIsLoading(false)
        }
    }

    const handleModelSelect = async (modelClave: string) => {
        if (!apiKey || !selectedYear || !selectedBrand) return
        const model = models.find(m => m.Clave === modelClave)
        if (!model) return
        setSelectedModel(model)
        setIsLoading(true)
        setError(null)
        try {
            const versionsData = await getVersionesPorAnioMarcaModelo(apiKey, selectedYear.Clave, selectedBrand.Clave, model)
            if (versionsData) {
                const validatedVersions = getVersionesPorAnioMarcaModeloSchema.parse(versionsData)
                setVersions(validatedVersions)
                setStep(4)
            } else {
                setError('No se pudieron cargar las versiones')
            }
        } catch (error) {
            setError('Error al cargar las versiones')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVersionSelect = async (versionClave: string) => {
        if (!apiKey) return
        const version = versions.find(v => v.Clave === versionClave)
        if (!version) return
        setSelectedVersion(version)
        setIsLoading(true)
        setError(null)
        try {
            const priceData = await getPrecioVersionPorClave(apiKey, version)
            if (priceData) {
                const validatedPrice = getPrecioVersionPorClaveSchema.parse(priceData)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setPrice(validatedPrice as any)
                setStep(5)
            } else {
                setError('No se pudo obtener el precio')
            }
        } catch (error) {
            setError('Error al obtener el precio')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isLoggedIn) {
        return (
            <div className="flex justify-center items-center w-full">
                <Card className="w-[350px] bg-white shadow-lg">
                    <CardHeader className="pb-4 bg-blue-50">
                        <CardTitle className="text-2xl font-bold text-center text-blue-800">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-blue-600 text-center">Ingresa tus credenciales para acceder al Libro Azul API</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700">Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-8 bg-white border-gray-300 text-gray-800"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-8 bg-white border-gray-300 text-gray-800"
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-4 w-4" />
                                )}
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center bg-gray-50 py-4">
                        <p className="text-sm text-gray-600">¿No tienes una cuenta? Contacta al administrador</p>
                    </CardFooter>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </Card>
            </div>
        )
    }
    return (
        <div className="flex justify-center items-center w-full">
            <Card className="w-[350px] bg-white shadow-lg">
                <CardHeader className="pb-4 bg-blue-50">
                    <CardTitle className="text-2xl font-bold text-center text-blue-800">Libro Azul API</CardTitle>
                    <CardDescription className="text-blue-600 text-center">Selecciona las características del vehículo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex justify-between items-center px-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    {step >= 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-gray-700">Año</Label>
                            <Select onValueChange={handleYearSelect} disabled={isLoading}>
                                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                                    <SelectValue placeholder="Selecciona un año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year.Clave} value={year.Clave}>{year.Nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {step >= 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-gray-700">Marca</Label>
                            <Select onValueChange={handleBrandSelect} disabled={isLoading}>
                                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                                    <Car className="mr-2 h-4 w-4 text-blue-500" />
                                    <SelectValue placeholder="Selecciona una marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map(brand => (
                                        <SelectItem key={brand.Clave} value={brand.Clave}>{brand.Nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {step >= 3 && (
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-gray-700">Modelo</Label>
                            <Select onValueChange={handleModelSelect} disabled={isLoading}>
                                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                                    <Truck className="mr-2 h-4 w-4 text-blue-500" />
                                    <SelectValue placeholder="Selecciona un modelo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map(model => (
                                        <SelectItem key={model.Clave} value={model.Clave}>{model.Nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {step >= 4 && (
                        <div className="space-y-2">
                            <Label htmlFor="version" className="text-gray-700">Versión</Label>
                            <Select onValueChange={handleVersionSelect} disabled={isLoading}>
                                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                                    <Cog className="mr-2 h-4 w-4 text-blue-500" />
                                    <SelectValue placeholder="Selecciona una versión" />
                                </SelectTrigger>
                                <SelectContent>
                                    {versions.map(version => (
                                        <SelectItem key={version.Clave} value={version.Clave}>{version.Nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {step === 5 && price && (
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2 text-blue-800">Precio estimado:</h3>
                            <div className="flex justify-center items-center space-x-2">
                                <p className="text-2xl font-bold text-green-600">Venta: ${price.Venta.toLocaleString()} {price.Moneda}</p>
                            </div>
                            <p className="text-sm text-blue-600 mt-1">Compra: ${price.Compra.toLocaleString()} {price.Moneda}</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center bg-gray-50 py-4 gap-2">
                    <Button variant="outline" onClick={() => {
                        setStep(1)
                        setSelectedYear(null)
                        setSelectedBrand(null)
                        setSelectedModel(null)
                        setSelectedVersion(null)
                        setPrice(null)
                    }} disabled={isLoading}
                        className="rounded-md">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reiniciar
                    </Button>
                    <Button onClick={() => {
                        setIsLoggedIn(false)
                        setApiKey(null)
                        setStep(0)
                        setYears([])
                        setSelectedYear(null)
                        setSelectedBrand(null)
                        setSelectedModel(null)
                        setSelectedVersion(null)
                        setPrice(null)
                    }} disabled={isLoading}
                        className="rounded-md">Cerrar  Sesión</Button>
                </CardFooter>
            </Card>
        </div >
    )
}