import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="hidden md:block relative w-1/2 h-full">
                <Image
                    src="/prase-bg.png"
                    alt="Prase Background"
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-blue-50 min-h-screen">
                <div className="w-full max-w-md">
                    <Image
                        src="/prase-logo.png"
                        alt="Prase logo"
                        width={150}
                        height={150}
                        className='mx-auto mb-5'
                    />
                    <h1 className="text-3xl font-bold uppercase mb-2 text-blue-800">Bienvenido a PRASE</h1>
                    <p className="mb-2 text-gray-600">
                        Inicia sesión con tus credenciales.
                    </p>
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}