import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpManagerService {
  constructor(private readonly http: HttpService) {}

  async get<TResponse = any>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'GET', url });
  }

  async post<TResponse = any, TBody = any>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'POST', url, data });
  }

  async put<TResponse = any, TBody = any>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'PUT', url, data });
  }

  async delete<TResponse = any>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>({ ...config, method: 'DELETE', url });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await lastValueFrom(this.http.request<T>(config));
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error?.response?.data?.message ?? error?.response?.data ?? error?.message ?? 'Unknown error';
      throw new HttpException(message, status);
    }
  }
}
