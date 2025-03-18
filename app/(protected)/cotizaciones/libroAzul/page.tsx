
import { Suspense } from 'react'
import LibroAzulForm from '@/components/admin/libroAzul/libroAzulForm'

export default function LibroAzul() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <LibroAzulForm />
        </Suspense>
    )
}