export enum RolesEnum {
  ADMIN = 1,
  VENDEDOR = 20,
  CLIENTE = 30,
  PROVEEDOR = 40,
}


export const roleTableMap: Record<RolesEnum, string> = {
  [RolesEnum.ADMIN]: 'usuarios.admin',
  [RolesEnum.VENDEDOR]: 'usuarios.vendedor',
  [RolesEnum.CLIENTE]: 'usuarios.cliente',
  [RolesEnum.PROVEEDOR]: 'usuarios.proveedor',
};