import { EstadoOrden, Orden } from '@medi-supply/ordenes-dm';
import { PedidosService } from './pedidos.service';

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
    actualizarOrden: jest.Mock<Promise<void>, [string, OrdenLocal]>;
  };

  let mockHttpCall: HttpManagerLocal;
  let mockConfig: ConfigLocal;
  let mockRepository: OrdenesRepositoryLocal;
  let service: PedidosService;

  beforeEach(() => {
    mockHttpCall = {
      post: jest.fn<Promise<void>, [string, ProductoOrdenLocal[], { headers: Record<string, string> }]>().mockResolvedValue(undefined),
    };

    mockConfig = {
      get: jest.fn<string, [string, string?]>().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'INVENTARIO_SERVICE_URL') return 'http://inventario.test/api';
        if (key === 'INTERNAL_SECRET') return 'internal-secret';
        return defaultValue ?? '';
      }),
    };

    mockRepository = {
      actualizarOrden: jest.fn<Promise<void>, [string, OrdenLocal]>().mockResolvedValue(undefined),
    };

    // Cast PedidosService constructor to a compatible newable type using local mock types
    const PedidosServiceCtor = PedidosService as unknown as new (
      httpCall: HttpManagerLocal,
      config: ConfigLocal,
      repo: OrdenesRepositoryLocal
    ) => PedidosService;

    service = new PedidosServiceCtor(mockHttpCall, mockConfig, mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls repository.actualizarOrden with estado RECIBIDO and then calls http post with products and Authorization header', async () => {
    const orden: OrdenLocal = {
      id: 'ord-1',
      cliente: 'cli-1',
      vendedor: 'vend-1',
      productos: [
        { lote: 'L1', cantidad: 2 },
      ],
    };

    await service.ActualizarOrden(orden as unknown as any); // runtime is fine; types aligned via ctor cast

    // repository called with id and updated order whose estado is RECIBIDO
    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    const [calledId, calledOrden] = mockRepository.actualizarOrden.mock.calls[0];
    expect(calledId).toBe('ord-1');
    expect(calledOrden).toBeDefined();
    expect(calledOrden.id).toBe('ord-1');
    expect(calledOrden.cliente).toBe('cli-1');
    expect(calledOrden.vendedor).toBe('vend-1');
    expect(calledOrden.productos).toEqual(orden.productos);
    expect(calledOrden.estado).toBe('RECIBIDO');

    // http post called with constructed URL, productos body and correct Authorization header
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

    await expect(service.ActualizarOrden(orden as unknown as any)).rejects.toThrow('DB failure');

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

    await expect(service.ActualizarOrden(orden as unknown as any)).rejects.toThrow('HTTP failure');

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
  });

  it('calls post with empty productos when order has empty products', async () => {
    const orden: OrdenLocal = {
      id: 'ord-empty',
      cliente: 'cli-empty',
      productos: [],
    };

    await service.ActualizarOrden(orden as unknown as any);

    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    const calledOrden = mockRepository.actualizarOrden.mock.calls[0][1];
    expect(Array.isArray(calledOrden.productos)).toBe(true);
    expect(calledOrden.productos.length).toBe(0);

    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
    const [, body] = mockHttpCall.post.mock.calls[0];
    expect(body).toEqual([]);
  });

  
});


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
        .fn<Promise<void>, [string, ProductoOrdenLocal[], { headers: Record<string, string> } ]>()
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

    // call using Orden type to avoid `any`
    await service.ActualizarOrden(orden as unknown as Orden);

    // repository called with id and updated order whose estado is RECIBIDO
    expect(mockRepository.actualizarOrden).toHaveBeenCalledTimes(1);
    const [calledId, calledOrden] = mockRepository.actualizarOrden.mock.calls[0];
    expect(calledId).toBe('ord-1');
    expect(calledOrden).toBeDefined();
    // compare against enum value
    expect(calledOrden.estado).toBe(EstadoOrden.RECIBIDO);

    // http post called with constructed URL, productos body and correct Authorization header
    expect(mockHttpCall.post).toHaveBeenCalledTimes(1);
    const [url, body, options] = mockHttpCall.post.mock.calls[0];
    expect(url).toBe('http://inventario.test/api/producto/actualizar-stock');
    expect(body).toEqual(orden.productos);
    expect(options).toBeDefined();
    expect(options.headers).toBeDefined();
    expect((options.headers as Record<string,string>)['Authorization']).toBe('Bearer internal-secret');
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
