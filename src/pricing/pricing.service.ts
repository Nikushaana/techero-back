import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { OrderType } from 'src/common/types/order-type.enum';
import { AddressService } from 'src/address/address.service';

@Injectable()
export class PricingService {
    constructor(
        private readonly addressService: AddressService,
    ) { }

    async calculatePrice(calculatePriceDto: CalculatePriceDto) {
        const address = await this.addressService.getOneAddress(calculatePriceDto.addressId);

        const branch = address.branch

        let price: number;

        switch (calculatePriceDto.service_type) {
            case OrderType.FIX_OFF_SITE:
                price = branch.fix_off_site_price;
                break;

            case OrderType.INSTALLATION:
                price = branch.installation_price;
                break;

            case OrderType.FIX_ON_SITE:
                price = branch.fix_on_site_price;
                break;

            default:
                throw new BadRequestException('Invalid service type');
        }

        return { price };
    }
}
