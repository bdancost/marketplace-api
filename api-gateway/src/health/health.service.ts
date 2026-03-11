import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getLiveStatus: any;
  getReadyStatus: any;
}
