import { Module } from '@nestjs/common';
import { JwtReadGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [],
  providers: [JwtReadGuard],
  exports: [ JwtReadGuard],
})
export class AuthModule {}
