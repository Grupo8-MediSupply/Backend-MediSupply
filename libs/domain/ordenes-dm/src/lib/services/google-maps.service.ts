import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoutesClient } from '@googlemaps/routing';
import { LatLngLiteral } from '@googlemaps/google-maps-services-js';

@Injectable()
export class RutasService {
  private readonly logger = new Logger(RutasService.name);
  private readonly client: RoutesClient;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    this.client = new RoutesClient({ apiKey: this.apiKey });
  }

  async generarRuta(
    origen: LatLngLiteral,
    bodegas: LatLngLiteral[],
    clientes: LatLngLiteral[],
  ) {
    const destination = clientes[clientes.length - 1];
    const intermediarios = [...bodegas, ...clientes.slice(0, -1)];

    // 🧩 Imprimir los puntos para depurar
    this.logger.debug({
      origen,
      destination,
      intermediarios,
    });

    const [response] = await this.client.computeRoutes(
      {
        origin: {
          location: {
            latLng: {
              latitude: origen.lat,
              longitude: origen.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        intermediates: intermediarios.map((p) => ({
          location: {
            latLng: { latitude: p.lat, longitude: p.lng },
          },
        })),
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes: false,
        polylineEncoding: 'ENCODED_POLYLINE',
        units: 'METRIC',
      },
      {
        otherArgs: {
          headers: {
            // 👇 Campo obligatorio (sin esto, da INVALID_ARGUMENT)
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs',
          },
        },
      },
    );

    const route = response.routes?.[0];

    if (!route) {
      this.logger.warn('⚠️ No se encontró una ruta válida');
      return null;
    }

    this.logger.log(`✅ Ruta generada: ${route.distanceMeters} metros`);
    return {
      distancia: route.distanceMeters,
      duracion: route.duration,
      polilinea: route.polyline?.encodedPolyline,
      legs: route.legs,
    };
  }
}
