import { ThrottletGuard } from './throttlet.guard';

describe('ThrottletGuard', () => {
  it('should be defined', () => {
    expect(new ThrottletGuard()).toBeDefined();
  });
});
