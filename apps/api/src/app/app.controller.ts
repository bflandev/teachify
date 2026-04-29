import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: 'ok';
  version: string;
}

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.0.0',
    };
  }
}
