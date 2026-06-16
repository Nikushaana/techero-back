import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GooglePlacesService {
    private readonly apiKey: string;
    private readonly autocompleteUrl: string;
    private readonly placeDetailsUrl: string;

    constructor() {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new InternalServerErrorException('GOOGLE_MAPS_API_KEY is not set');
        }
        if (!process.env.GOOGLE_MAPS_AUTOCOMPLETE_URL) {
            throw new InternalServerErrorException('GOOGLE_MAPS_AUTOCOMPLETE_URL is not set');
        }
        if (!process.env.GOOGLE_MAPS_PLACE_DETAILS_URL) {
            throw new InternalServerErrorException('GOOGLE_MAPS_PLACE_DETAILS_URL is not set');
        }

        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.autocompleteUrl = process.env.GOOGLE_MAPS_AUTOCOMPLETE_URL;
        this.placeDetailsUrl = process.env.GOOGLE_MAPS_PLACE_DETAILS_URL;
    }

    async autocomplete(params: Record<string, any>) {
        params.key = this.apiKey;

        const response = await axios.get(this.autocompleteUrl, { params });
        
        return response.data?.predictions || [];
    }

    async getPlaceDetails(placeId: string) {
        const params = {
            place_id: placeId,
            key: this.apiKey,
            fields: 'geometry',
        };

        const response = await axios.get(this.placeDetailsUrl, { params });
        const { result } = response.data;

        if (!result?.geometry?.location) return null;

        return {
            location: result.geometry.location,
        };
    }
}
