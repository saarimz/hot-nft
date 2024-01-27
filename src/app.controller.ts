import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

const reservoirKey = process.env.RESERVOIR_API_KEY;

const HtmlResponse = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    response.type('text/html');
    return response;
  },
);

const CHAIN_ID_TO_NAME = {
  1: 'Ethereum',
  10: 'Optimism',
  7777777: 'Zora',
  137: 'Polygon',
  42161: 'Arbitrum',
  8453: 'Base',
};

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getHtml(@HtmlResponse() res: any) {
    try {
      const mintsResponse = await _getTrendingMints();

      const mints = mintsResponse.mints;

      const randomIndex = Math.floor(Math.random() * mints.length);

      const mint = mints[randomIndex];

      const collectionRes = await _getCollectionDetails(mint.id);

      const collectionData = collectionRes.collections[0];

      const image = collectionData.image;
      const name = collectionData.name;
      const chainId = collectionData.chainId;
      const contractAddress = collectionData.id;
      const owners = `${mint.owners ?? mint.ownerCount} owners`;
      const mintUrl = `https://zora.co/collect/${chainId}:${contractAddress}`;
      const chainName = CHAIN_ID_TO_NAME[chainId] ?? chainId;

      const shortContractAddress = `${contractAddress.slice(0, 5)}...`;

      const data = `
     <!DOCTYPE html>
    <html>
      <head>
        <title>🔥🔥🔥 HOT NFT 🔥🔥🔥</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:button:1" content="${name}" />
        <meta property="fc:frame:button:2" content="${chainName}" />
        <meta property="fc:frame:button:3" content="${shortContractAddress}" />
        <meta property="fc:frame:button:4" content="${owners}" />
      </head>
      <body className="flex flex-col align-center">
        <h1>🔥🔥🔥 HOT NFT 🔥🔥🔥</h1>
        <div>
          <p>Visit this frame on warpcast.com</p>
        </div>
        <h2>${name}</h2>
         <p><a href="${mintUrl}" target="_blank"><p>Mint</p></a>
        <img src="${image}" alt="${name}"/>
      </body>
    </html>`;

      return res.status(HttpStatus.OK).send(data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('<h1>Error fetching data</h1>');
    }
  }
}

async function _getTrendingMints() {
  const url =
    'https://api.reservoir.tools/collections/trending-mints/v1?limit=10&period=10m';

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': reservoirKey,
    },
  });

  return response.data;
}

async function _getCollectionDetails(id: string) {
  const url = `https://api.reservoir.tools/collections/v7?id=${id}`;

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': reservoirKey,
    },
  });

  return response.data;
}
