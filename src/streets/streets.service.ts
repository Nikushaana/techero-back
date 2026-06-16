import { Injectable } from '@nestjs/common';
import { GooglePlacesService } from 'src/common/services/google-places/google-places.service';

@Injectable()
export class StreetsService {
    constructor(private readonly googlePlaces: GooglePlacesService) { }

    async getStreets(street: string) {
        const predictions = await this.googlePlaces.autocomplete({
            input: `${street}`,
            types: 'address',
            components: 'country:GE',
        });

        const results = await Promise.all(
            predictions.map(async (p: any) => {
                const details = await this.googlePlaces.getPlaceDetails(p.place_id);
                return {
                    id: p.place_id,
                    name: p.description,
                    location: details?.location,
                };
            }),
        );

        return results;
    }
}
