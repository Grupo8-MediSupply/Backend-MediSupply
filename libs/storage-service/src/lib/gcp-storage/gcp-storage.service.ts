import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GcpStorageService {
  private readonly logger = new Logger(GcpStorageService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');
    this.bucketName = this.configService.get<string>('GCP_BUCKET_NAME', '');

    // ✅ Usa Application Default Credentials (Cloud Run) o key local si está definida
    this.storage = new Storage({
      projectId,
      keyFilename: this.configService.get<string>(
        'GCP_KEYFILE_PATH',
        "Test"
      ),
    });
  }

  private get bucket() {
    return this.storage.bucket(this.bucketName);
  }

  async uploadBuffer(
    buffer: Buffer,
    mimetype: string,
    originalName: string
  ): Promise<{ signedUrl: string; objectUrl: string; path: string }> {
    const ext = originalName.split('.').pop();
    const fileName = `${randomUUID()}.${ext}`;
    const path = `videos/${fileName}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(path);

    this.logger.log(`📤 Subiendo video a GCS: ${fileName}`);

    await file.save(buffer, {
      resumable: false,
      contentType: mimetype,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    // URL firmada temporal (1 hora)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hora
    });

    // URL permanente del objeto (no accesible públicamente)
    const objectUrl = `https://storage.googleapis.com/${this.bucketName}/${path}`;

    return { signedUrl, objectUrl, path };
  }

  /**
   * Genera una nueva URL firmada temporal para un video existente.
   * @param path Ruta del archivo (ej: videos/uuid.mp4)
   */
  async getSignedUrl(path: string, expiresInMs = 60 * 60 * 1000): Promise<string> {
    const file = this.storage.bucket(this.bucketName).file(path);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMs,
    });
    return url;
  }
}
