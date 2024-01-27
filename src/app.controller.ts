import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get, HttpStatus
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import axios from "axios";

const reservoirKey = 'e3db139a-f584-52a8-a9e0-28d7e003c392';

const HtmlResponse = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    response.type('text/html');
    return response;
  },
);

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getHtml(@HtmlResponse() res: any) {
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
    const mintUrl = `https://zora.co/collect/${chainId}:${contractAddress}`;

    const data = `
     <!DOCTYPE html>
    <html>
      <head>
        <title>🔥🔥🔥 HOT NFT 🔥🔥🔥</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:button:1" content="${mintUrl}" />
      </head>
      <body className="flex flex-col align-center">
        <h1>🔥🔥🔥 HOT NFT 🔥🔥🔥</h1>
        <div>
        
        </div>
        <h2>${name}</h2>
         <p><a href="${mintUrl}" target="_blank"><p>Mint</p></a>
        <img src="${image}" alt="${name}"/>
      </body>
    </html>`;

    return res.status(HttpStatus.OK).send(data);
  }
}

async function _getTrendingMints() {
  const url =
    'https://api.reservoir.tools/collections/trending-mints/v1?limit=50&period=10m';

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': reservoirKey,
    },
  });

  return response.data;
}

async function _getCollectionDetails(id: string)  {
  const url = `https://api.reservoir.tools/collections/v7?id=${id}`;

  const response = httpService.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': reservoirKey,
    },
  });


  return response.data;
}
