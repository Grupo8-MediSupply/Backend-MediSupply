import { Inject, Injectable } from '@nestjs/common';
import { CreateVendedorDto } from './dtos/create-vendedor.dto';
import type { IVendedorRepository } from "@medi-supply/perfiles-dm";
import { Vendedor } from "@medi-supply/perfiles-dm";



@Injectable()
export class VendedoresService {
  constructor(
    @Inject('IVendedorRepository')
    private readonly repo: IVendedorRepository,
  ) {}


    create(createVendedorDto: CreateVendedorDto): Promise<Vendedor> {

    const props = {
        email: createVendedorDto.email,
        territorio: createVendedorDto.territorio,
        nombre: createVendedorDto.nombre,
        rolId: 1,
        paisId: 1,
        password: "Testo1234$",
    }
    const vendedor = new Vendedor(props);
    return this.repo.create(vendedor);
  }
}
