"use client"

import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";

interface PropiedadesLoader {
    texto?: string;
}

export const LoaderModales = ({ texto = "" }: PropiedadesLoader) => {
    return (
        <div className="w-full h-[300px] flex flex-col justify-center items-center gap-4 container">
            <SyncLoader size={8} color="#9ca3af" />
            {texto && (
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground animate-pulse"
                >
                    {texto}
                </motion.span>
            )}
        </div>
    );
};