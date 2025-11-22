/* eslint-disable @typescript-eslint/no-explicit-any */
import { EstadoOrden, Orden, ProductoOrden, RepartoOrden, Vehiculo } from '@medi-supply/ordenes-dm';
import { PedidosService } from './pedidos.service';
import { ObtenerPedidosQueryDto } from './dtos/filtro-obtener-ordenes.dto';

// TypeScript
describe('PedidosService - ActualizarOrden', () => {
  type ProductoOrdenLocal = {
    lote: string;
    cantidad: number;
    productoRegional?: string;
    precioUnitario?: number;
  };

  type OrdenLocal = {
    id: string;
    cliente: string;
    vendedor?: string;
    productos: ProductoOrdenLocal[];
    estado?: string;
  };

  type HttpManagerLocal = {
    post: jest.Mock<Promise<void>, [string, ProductoOrdenLocal[], { headers: Record<string, string> }]>;
  };

  type ConfigLocal = {
    get: jest.Mock<string, [string, string?]>;
  };

  type OrdenesRepositoryLocal = {
    actualizarOrden: jest.Mock<Promise<void>, [string, Orden | Record<string, unknown>]>;
  };

  type RutasServiceLocal = {
    generarRuta?: jest.Mock<Promise<unknown>, any[]>;
  };

  let mockHttpCall: HttpManagerLocal;
  let mockConfig: ConfigLocal;
  let mockRepository: OrdenesRepositoryLocal;
  let mockRutasService: RutasServiceLocal;
  let service: PedidosService;

  beforeEach(() => {
    mockHttpCall = {
      post: jest
        .fn<Promise<void>, [string, ProductoOrdenLocal[], { headers: Record<string, string> }]>()
        .mockResolvedValue(undefined),
    };

    mockConfig = {
      get: jest.fn<string, [string, string?]>().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'INVENTARIO_SERVICE_URL') return 'http://inventario.test/api';
        if (key === 'INTERNAL_SECRET') return 'internal-secret';
        return defaultValue ?? '';
      }),
    };

    mockRepository = {
      actualizarOrden: jest.fn<Promise<void>, [string, Orden | Record<string, unknown>]>().mockResolvedValue(undefined),
    };

    mockRutasService = {
      generarRuta: jest.fn().mockResolvedValue(undefined),
    };

    // Include rutasService in constructor cast (matches actual service constructor)
    const PedidosServiceCtor = PedidosService as unknown as new (
      httpCall: HttpManagerLocal,
      config: ConfigLocal,
      repo: OrdenesRepositoryLocal,
      rutasService: RutasServiceLocal
    ) => PedidosService;

    service = new PedidosServiceCtor(mockHttpCall, mockConfig, mockRepository, mockRutasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls repository.actualizarOrden with estado RECIBIDO and then calls http post with products and Authorization header', async () => {
    const orden: OrdenLocal = {
      id: 'ord-1',
      cliente: 'cli-1',
      vendedor: 'vend-1',
      productos: [{ lote: 'L1', cantidad: 2 }],
    };

    await service.ActualizarOrden(orden as unknown as Orden);

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    const [calledId, calledOrden] = mockRepository.actualizarOrden.mock.calls[0];
    expect(calledId).toBe('ord-1');
    expect(calledOrden).toBeDefined();
    expect(calledOrden.estado).toBe(EstadoOrden.RECIBIDO);

    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
    const [url, body, options] = mockHttpCall.post.mock.calls[0];
    expect(url).toBe('http://inventario.test/api/producto/actualizar-stock');
    expect(body).toEqual(orden.productos);
    expect(options).toBeDefined();
    expect(options.headers).toBeDefined();
    expect(options.headers['Authorization']).toBe('Bearer internal-secret');
  });

  it('propagates repository error and does not call http post', async () => {
    const orden: OrdenLocal = {
      id: 'ord-err',
      cliente: 'cli-err',
      productos: [{ lote: 'LX', cantidad: 1 }],
    };

    const repoError = new Error('DB failure');
    mockRepository.actualizarOrden.mockRejectedValueOnce(repoError);

    await expect(service.ActualizarOrden(orden as unknown as Orden)).rejects.toThrow('DB failure');

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    expect(mockHttpCall.post).not.toHaveBeenCalled();
  });

  it('propagates http error after repository success', async () => {
    const orden: OrdenLocal = {
      id: 'ord-http-err',
      cliente: 'cli-http',
      productos: [{ lote: 'LH', cantidad: 5 }],
    };

    const httpError = new Error('HTTP failure');
    mockHttpCall.post.mockRejectedValueOnce(httpError);

    await expect(service.ActualizarOrden(orden as unknown as Orden)).rejects.toThrow('HTTP failure');

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
  });

  it('calls post with empty productos when order has empty products', async () => {
    const orden: OrdenLocal = {
      id: 'ord-empty',
      cliente: 'cli-empty',
      productos: [],
    };

    await service.ActualizarOrden(orden as unknown as Orden);

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    const calledOrden = mockRepository.actualizarOrden.mock.calls[0][1] as Record<string, unknown>;
    expect(Array.isArray(calledOrden.productos)).toBe(true);
    expect((calledOrden.productos as unknown[]).length).toBe(0);

    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
    const [, body] = mockHttpCall.post.mock.calls[0];
    expect(body).toEqual([]);
  });
});

describe('PedidosService - ObtenerOrdenesParaEntregar', () => {
  let mockHttpCall: any;
  let mockConfig: any;
  let mockRepository: any;
  let mockRutasService: any;
  let service: PedidosService;

  beforeEach(() => {
    mockHttpCall = {
      post: jest.fn(),
    };

    mockConfig = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'INVENTARIO_SERVICE_URL') return 'http://localhost:3002/api/v1';
        if (key === 'INTERNAL_SECRET') return 'test-secret';
        return defaultValue;
      }),
    };

    mockRepository = {
      actualizarOrden: jest.fn(),
      obtenerOrdenesParaEntregar: jest.fn(),
      obtenerVehiculoMasCercano: jest.fn(),
    };

    mockRutasService = {
      generarRuta: jest.fn(),
    };

    service = new PedidosService(
      mockHttpCall,
      mockConfig,
      mockRepository,
      mockRutasService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería retornar órdenes de reparto mapeadas correctamente', async () => {
    const paisId = 1;
    const fechaInicio = '2025-01-01';
    const fechaFin = '2025-01-31';

    const ordenesParaEntregar = [
      {
        id: 'orden-1',
        cliente: {
          id: 'cliente-1',
          nombre: 'Cliente 1',
          ubicacion: {
            lat: -12.0464,
            lng: -77.0428,
          },
        },
        vendedor: 'vendedor-1',
        productos: [
          {
            lote: 'lote-1',
            cantidad: 10,
            productoRegional: 'prod-1',
            precioUnitario: 100,
          },
        ],
        ubicacion: {
          lat: -12.0464,
          lng: -77.0428,
        },
        bodegasOrigen: [
          { id: 'bodega-1', ubicacion: { lat: -12.0500, lng: -77.0500 } },
        ],
      },
      {
        id: 'orden-2',
        cliente: {
          id: 'cliente-2',
          nombre: 'Cliente 2',
          ubicacion: {
            lat: -12.0500,
            lng: -77.0500,
          },
        },
        vendedor: 'vendedor-2',
        productos: [
          {
            lote: 'lote-2',
            cantidad: 5,
            productoRegional: 'prod-2',
            precioUnitario: 200,
          },
        ],
        ubicacion: {
          lat: -12.0500,
          lng: -77.0500,
        },
        bodegasOrigen: [
          { id: 'bodega-2', ubicacion: { lat: -12.0600, lng: -77.0600 } },
        ],
      },
    ];

    mockRepository.obtenerOrdenesParaEntregar.mockResolvedValue(ordenesParaEntregar);

    const result = await service.ObtenerOrdenesParaEntregar(paisId, fechaInicio, fechaFin);

    expect(mockRepository.obtenerOrdenesParaEntregar).toHaveBeenCalledWith({
      paisId,
      fechaInicio,
      fechaFin,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('debería retornar array vacío cuando no hay órdenes', async () => {
    const paisId = 1;
    mockRepository.obtenerOrdenesParaEntregar.mockResolvedValue([]);

    const result = await service.ObtenerOrdenesParaEntregar(paisId);

    expect(mockRepository.obtenerOrdenesParaEntregar).toHaveBeenCalledWith({
      paisId,
      fechaInicio: undefined,
      fechaFin: undefined,
    });
    expect(result).toEqual([]);
  });

  it('debería propagar errores del repositorio', async () => {
    const paisId = 1;
    mockRepository.obtenerOrdenesParaEntregar.mockRejectedValue(
      new Error('DB error')
    );

    await expect(service.ObtenerOrdenesParaEntregar(paisId)).rejects.toThrow('DB error');
  });
});

describe('PedidosService - GenerarRutasDeReparto', () => {
  let mockHttpCall: any;
  let mockConfig: any;
  let mockRepository: any;
  let mockRutasService: any;
  let service: PedidosService;
  const repartoOrdenes: RepartoOrden[] = [
    {
      orden: {
        id: 'orden-1',
        cliente: {
          id: 'cliente-1',
          nombre: 'Cliente 1',
          ubicacion: {
            lat: -12.0464,
            lng: -77.0428,
          },
        },
        estado: 'PENDIENTE',
        bodegasOrigen: [
          { id: 'bodega-1', ubicacion: { lat: -12.0500, lng: -77.0500 } },
        ],
      } as any,
      vehiculoAsignado: new Vehiculo({
        id: 'vehiculo-1',
        modelo: 'Modelo X',
        pais: 1,
        placa: 'ABC-123',
        ubicacionGeografica: {
          lat: -12.0464,
          lng: -77.0428,
        },
      }),
    },
    {
      orden: {
        id: 'orden-2',
        cliente: {
          id: 'cliente-2',
          nombre: 'Cliente 2',
          ubicacion: {
            lat: -12.0500,
            lng: -77.0500,
          },
        },
        estado: 'PENDIENTE',
        bodegasOrigen: [
          { id: 'bodega-2', ubicacion: { lat: -12.0600, lng: -77.0600 } },
        ],
      } as any,
      vehiculoAsignado: new Vehiculo({
        id: 'vehiculo-1',
        modelo: 'Modelo X',
        pais: 1,
        placa: 'ABC-123',
        ubicacionGeografica: {
          lat: -12.0500,
          lng: -77.0500,
        },
      }),
    },
  ];

  beforeEach(() => {
    mockHttpCall = {
      post: jest.fn(),
    };

    mockConfig = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'INVENTARIO_SERVICE_URL') return 'http://localhost:3002/api/v1';
        if (key === 'INTERNAL_SECRET') return 'test-secret';
        return defaultValue;
      }),
    };

    mockRepository = {
      actualizarOrden: jest.fn(),
      obtenerOrdenesParaEntregar: jest.fn(),
      findById: jest.fn(),
      buscarOrdenPorId: jest.fn(),
  guardarRutaDeReparto: jest.fn().mockResolvedValue('ruta-guardada'),
  buscarRutaPorOrdenId: jest.fn(),
    };

    mockRutasService = {
      generarRuta: jest.fn(),
      obtenerRutaPorOrdenId: jest.fn(),
    };

    service = new PedidosService(
      mockHttpCall,
      mockConfig,
      mockRepository,
      mockRutasService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería filtrar órdenes que ya tienen ruta asignada', async () => {
    mockRepository.buscarOrdenPorId.mockResolvedValue({
      id: 'orden-1',
      cliente: { id: 'cliente-1', nombre: 'Cliente 1' },
      bodegasOrigen: [],
    });

    mockRutasService.obtenerRutaPorOrdenId = jest.fn()
      .mockResolvedValueOnce({ id: 'ruta-1' })
      .mockResolvedValueOnce(null);

    mockRutasService.generarRuta.mockResolvedValue({
      id: 'ruta-nueva',
      vehiculoId: 'vehiculo-1',
      ordenes: ['orden-2'],
    });

    const result = await service.GenerarRutasDeReparto(repartoOrdenes);

    expect(result).toBeDefined();
  });

  it('debería generar rutas y llamar a guardarRutaDeReparto y actualizarOrden', async () => {
    // Ambos órdenes no tienen ruta inicialmente
    mockRepository.buscarOrdenPorId.mockResolvedValueOnce({ id: 'orden-1' });
    mockRepository.buscarOrdenPorId.mockResolvedValueOnce({ id: 'orden-2' });

    // generarRuta devuelve datos válidos
    mockRutasService.generarRuta.mockResolvedValueOnce({
      distancia: 1234,
      duracion: { seconds: 600 },
      polilinea: 'poly',
      legs: [],
    });

    // guardarRutaDeReparto devuelve un id de ruta
    mockRepository.guardarRutaDeReparto.mockResolvedValueOnce('ruta-1');

    const result = await service.GenerarRutasDeReparto(repartoOrdenes);

    expect(mockRepository.guardarRutaDeReparto).toHaveBeenCalledTimes(1);
    expect(mockRepository.guardarRutaDeReparto).toHaveBeenCalledWith('vehiculo-1', expect.any(Object));

    // Se debe actualizar cada orden del grupo con estado ENVIADO y ruta_id
    expect(mockRepository.actualizarOrden).toHaveBeenCalled();
  const actualizarCalls = mockRepository.actualizarOrden.mock.calls.map((c: any[]) => c[0]);
  expect(actualizarCalls).toEqual(expect.arrayContaining(['orden-1', 'orden-2']));

    // El resultado debe contener la ruta generada con rutaId
    expect(Array.isArray(result)).toBe(true);
    expect(result.some(r => (r as any).rutaId === 'ruta-1')).toBe(true);
  });

  it('no debe agregar rutas cuando rutasService.generarRuta devuelve null', async () => {
    mockRepository.buscarOrdenPorId.mockResolvedValue({ id: 'orden-1' });
    // generarRuta devuelve null -> sin rutas generadas
    mockRutasService.generarRuta.mockResolvedValueOnce(null);
    mockRepository.buscarRutaPorOrdenId = jest.fn().mockResolvedValue(null);

    const result = await service.GenerarRutasDeReparto(repartoOrdenes);

    // No se guardó ruta y no se actualizaron órdenes
    expect(mockRepository.guardarRutaDeReparto).not.toHaveBeenCalled();
    expect(mockRepository.actualizarOrden).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('debería retornar array vacío cuando todas las órdenes ya tienen ruta', async () => {
    mockRepository.buscarOrdenPorId.mockResolvedValue({
      id: 'orden-1',
      cliente: { id: 'cliente-1', nombre: 'Cliente 1' },
      bodegasOrigen: [],
    });

    mockRutasService.obtenerRutaPorOrdenId = jest.fn()
      .mockResolvedValue({ id: 'ruta-existente' });

    const result = await service.GenerarRutasDeReparto(repartoOrdenes);

    expect(result).toEqual([]);
  });

  it('debería propagar errores del servicio de rutas', async () => {
    mockRepository.buscarOrdenPorId.mockRejectedValue(new Error('Rutas service error'));

    await expect(service.GenerarRutasDeReparto(repartoOrdenes)).rejects.toThrow(
      'Rutas service error'
    );
  });
});

describe('PedidosService - reducirStockProductos', () => {
  let mockHttpCall: any;
  let mockConfig: any;
  let mockRepository: any;
  let mockRutasService: any;
  let service: PedidosService;
  const productosOrden: ProductoOrden[] = [
    {
      lote: 'lote-err',
      cantidad: 3,
      productoRegional: 'prod-err',
      bodega: 'bodega-err',
    },
  ];

  beforeEach(() => {
    mockHttpCall = {
      post: jest.fn(),
    };

    mockConfig = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'INVENTARIO_SERVICE_URL') return 'http://localhost:3002/api/v1';
        if (key === 'INTERNAL_SECRET') return 'test-secret';
        return defaultValue;
      }),
    };

    mockRepository = {
      actualizarOrden: jest.fn(),
      obtenerOrdenesParaEntregar: jest.fn(),
    };

    mockRutasService = {
      generarRuta: jest.fn(),
    };

    service = new PedidosService(
      mockHttpCall,
      mockConfig,
      mockRepository,
      mockRutasService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería llamar al servicio de inventario con los productos correctos', async () => {
    mockHttpCall.post.mockResolvedValue(undefined);

    await service.reducirStockProductos(productosOrden);

    expect(mockHttpCall.post).toHaveBeenCalledWith(
      'http://localhost:3002/api/v1/producto/actualizar-stock',
      productosOrden,
      {
        headers: {
          Authorization: 'Bearer test-secret',
        },
      }
    );
  });

  it('debería propagar errores del servicio HTTP', async () => {
    mockHttpCall.post.mockRejectedValue(new Error('HTTP error'));

    await expect(service.reducirStockProductos(productosOrden)).rejects.toThrow('HTTP error');
  });
});

describe('PedidosService - ObtenerPedidosPorCliente', () => {
  // Using local typed mocks to satisfy lint rules
  type MockHttp = { post: jest.Mock };
  type MockConfig = { get: jest.Mock };
  type MockRepository = { obtenerOrdenesPorCliente: jest.Mock };
  type MockRutas = { generarRuta: jest.Mock };

  let mockHttpCall: MockHttp;
  let mockConfig: MockConfig;
  let mockRepository: MockRepository;
  let mockRutasService: MockRutas;
  let service: PedidosService;

  beforeEach(() => {
    mockHttpCall = { post: jest.fn() };
    mockConfig = { get: jest.fn() };
    mockRepository = {
      obtenerOrdenesPorCliente: jest.fn(),
    };
    mockRutasService = { generarRuta: jest.fn() };

    // Cast constructor to accept our minimal mocks (matches earlier pattern)
    const PedidosServiceCtor = PedidosService as unknown as new (
      httpCall: MockHttp,
      config: MockConfig,
      repo: MockRepository,
      rutasService: MockRutas
    ) => PedidosService;

    service = new PedidosServiceCtor(mockHttpCall, mockConfig, mockRepository, mockRutasService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debe retornar órdenes del repositorio cuando existen', async () => {
    const clienteId = 'cliente-123';
  const query: ObtenerPedidosQueryDto = { page: 0, limit: 10 };
    const expected = [{ id: 'o1' }, { id: 'o2' }];

    mockRepository.obtenerOrdenesPorCliente.mockResolvedValueOnce(expected);

    const res = await service.ObtenerPedidosPorCliente(clienteId, query);

    expect(mockRepository.obtenerOrdenesPorCliente).toHaveBeenCalledWith(clienteId, query);
    expect(res).toBe(expected);
  });

  it('debe retornar array vacío cuando no hay órdenes', async () => {
    const clienteId = 'cliente-empty';
  const query: ObtenerPedidosQueryDto = { page: 1, limit: 5 };

    mockRepository.obtenerOrdenesPorCliente.mockResolvedValueOnce([]);

    const res = await service.ObtenerPedidosPorCliente(clienteId, query);

    expect(mockRepository.obtenerOrdenesPorCliente).toHaveBeenCalledWith(clienteId, query);
    expect(res).toEqual([]);
  });

  it('debe propagar errores del repositorio', async () => {
    const clienteId = 'cliente-err';
  const query: ObtenerPedidosQueryDto = { page: 0 };

    mockRepository.obtenerOrdenesPorCliente.mockRejectedValueOnce(new Error('DB error'));

    await expect(service.ObtenerPedidosPorCliente(clienteId, query)).rejects.toThrow('DB error');
  });
});