import axios from 'axios';
import { Body, Controller, Post } from 'routing-controllers';

interface ElnatsAgare {
  elomradeAdress: {
    success: 0 | 1;
    error: { errorCode: 0; errorString: '' };
    input: {
      ip: string;
      gata: string;
      ort: string;
      postnummer: number;
      lat: string;
      long: string;
    };
    elnat: {
      elomrade: number;
      natagare: string;
      natomradeNamn: string;
      natomradeBeteckning: string;
      EdielID: number;
      telefon: string;
      epost: string;
    };
    geografi: {
      ort: unknown;
      kommun: string;
      elskatt: number;
      elskattNamn: string;
      latitud: number;
      longitud: number;
    };
  };
}

// Controller exposing endpoint for fetching net owner information
@Controller()
export class NetOwnerController {
  // Endpoint for fetching net owner information
  @Post('/netowner')
  async getNetOwner(@Body() facility: { address: { street: string; city: string } }): Promise<string> {
    const elnatsagare = await axios.get<ElnatsAgare>(
      `https://elomraden.se/api/lookup/typ/adress/adress/${encodeURIComponent(facility.address?.street)}/ort/${encodeURIComponent(
        facility.address?.city,
      )}/output/json/user/sundsvall_test/key/166dfcf731348498a23a3c2857`,
    );
    return elnatsagare.data.elomradeAdress?.elnat?.natagare || 'Okänd elnätsägare';
  }
}
