"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleReiniciar = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto max-w-2xl h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Lo sentimos</AlertTitle>
            <AlertDescription>
              Ha ocurrido un error inesperado. Por favor, reinicia la aplicación
              para continuar.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            Si el problema persiste, contacta al equipo de soporte técnico para
            recibir asistencia.
            {error.digest && (
              <p className="mt-2">
                Error ID: <code className="font-mono">{error.digest}</code>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleReiniciar}>Intentar nuevamente</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
