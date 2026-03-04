/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ThrottlerGuard } from './throttler.guard';

describe('ThrottlerGuard', () => {
  it('should be defined', () => {
    expect(new ThrottlerGuard()).toBeDefined();
  });
});
