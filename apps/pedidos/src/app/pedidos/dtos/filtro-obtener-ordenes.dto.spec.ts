import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ObtenerPedidosQueryDto } from './filtro-obtener-ordenes.dto';
import { EstadoOrden } from '@medi-supply/ordenes-dm';

describe('ObtenerPedidosQueryDto', () => {
  it('transforma state a mayúsculas y acepta un estado válido', async () => {
    const plain = { state: 'recibido', page: 2, limit: 10 };
    const dto = plainToInstance(ObtenerPedidosQueryDto, plain);

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.state).toBe(EstadoOrden.RECIBIDO);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('retorna error de validación para state inválido', async () => {
    const plain = { state: 'invalid-state' };
    const dto = plainToInstance(ObtenerPedidosQueryDto, plain);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const stateError = errors.find((e) => e.property === 'state');
    expect(stateError).toBeDefined();
  });

  it('aplica valores por defecto para page y limit y valida rangos', async () => {
    const dto = plainToInstance(ObtenerPedidosQueryDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.page).toBe(0);
    expect(dto.limit).toBe(25);

    // límite fuera de rango debe generar error
    const dtoBad = plainToInstance(ObtenerPedidosQueryDto, { limit: 200 });
    const errorsBad = await validate(dtoBad);
    expect(errorsBad.length).toBeGreaterThan(0);
    const limitError = errorsBad.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });
});
