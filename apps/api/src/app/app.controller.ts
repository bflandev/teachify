import { Controller, Get } from '@nestjs/common';
import type { ISODateString } from '@learnwren/shared-data-models';

interface HealthResponse {
  status: 'ok';
  version: string;
  serverTime: ISODateString;
}

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.0.0',
      serverTime: new Date().toISOString() as ISODateString,
    };
  }
}
