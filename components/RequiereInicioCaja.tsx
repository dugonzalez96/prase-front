"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useInicioCaja } from "@/context/InicioCajaContext";

export function RequiereInicioCaja({ children }: { children: React.ReactNode }) {
    const [verificando, setVerificando] = useState(true);
    const { inicioCaja, verificarInicioCaja } = useInicioCaja();
    const router = useRouter();

    useEffect(() => {
        const validar = async () => {
            const tieneInicioCaja = await verificarInicioCaja();
            setVerificando(false);

            if (!tieneInicioCaja) {
                router.push('/');
            }
        };

        validar();
    }, []);

    if (verificando) {
        return <div>Verificando inicio de caja...</div>;
    }

    if (!inicioCaja) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Necesitas tener un inicio de caja activo para acceder a esta sección
                </AlertDescription>
            </Alert>
        );
    }

    return <>{children}</>;
}