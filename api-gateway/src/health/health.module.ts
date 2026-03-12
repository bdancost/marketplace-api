import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthCheckService } from 'src/common/health/health-check.service';
import { CircuitBreakerModule } from 'src/common/circuit-breaker/circuit-breaker.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, CircuitBreakerModule],
  controllers: [HealthController],
  providers: [HealthService, HealthCheckService],
})
export class HealthModule {}
