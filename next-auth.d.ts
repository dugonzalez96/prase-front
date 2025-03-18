import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

export interface Aplicaciones {
  aplicacionId: number;
  nombre: string;
  descripcion: string;
  icon: null;
  color: null;
  categoria: string;
  ingresar: boolean;
  insertar: boolean;
  eliminar: boolean;
  actualizar: boolean;
}

export interface UsuarioLogin {
  UsuarioID: number;
  NombreUsuario: string;
  EmpleadoID: null | number;
}

export interface EmpleadoLogin {
  EmpleadoID: number;
  Nombre: string;
  Paterno: string;
  Materno: string;
  FechaNacimiento: Date;
  SueldoQuincenal: string;
  PorcentajeComisiones: string;
  TipoEmpleado: null | number;
}

export interface GrupoLogin {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CustomUser extends DefaultUser {
  jwt: string;
  aplicaciones: Aplicaciones[];
  usuario: UsuarioLogin;
  empleado: EmpleadoLogin;
  grupo: GrupoLogin;
}

declare module "next-auth" {
  interface Session {
    user: CustomUser & DefaultSession["user"];
  }

  interface User extends CustomUser { }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    aplicaciones: Aplicaciones[];
    usuario: UsuarioLogin,
    empleado: EmpleadoLogin,
    grupo: GrupoLogin,
  }
}
