import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PropiedadesMensajeError {
    mensaje: string;
}

export function MensajeError({ mensaje }: PropiedadesMensajeError) {
    return (
        <Alert variant="destructive" className="w-fit">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
    );
}