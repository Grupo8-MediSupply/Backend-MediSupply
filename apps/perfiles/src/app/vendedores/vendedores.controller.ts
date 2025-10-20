import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedoresService } from './vendedores.service';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';

@Controller('v1/vendedores')
export class VendedoresController {

    constructor(private readonly vendedoresService: VendedoresService) {}

    @UseGuards(RolesGuard)
    @Roles(RolesEnum.ADMIN)
    @Post()
    createVendedor(@Body() createVendedorDto: CreateVendedorDto,@User() userRequest: JwtPayloadDto) {
        return this.vendedoresService.create(createVendedorDto, userRequest.pais);
    }
}