import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RolUsuario } from './entities/usuario.entity';

export const IS_PUBLIC_KEY = 'esPublico';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'rolesPermitidos';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);

export interface UsuarioAutenticado {
  usuarioId: number;
  email: string;
  rol: RolUsuario;
  estudianteId: number | null;
  docenteId: number | null;
}

export const UsuarioActual = createParamDecorator(
  (_data: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    return contexto.switchToHttp().getRequest().usuario;
  },
);
