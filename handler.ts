import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

const https = require('https');
const  convert = require('xml-js');

export const getSlides: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {

  let queryParams = event.queryStringParameters;

  let url = 'https://www.slideshare.net/api/2/get_slideshows_by_user?username_for=' + queryParams.username_for
  + '&ts=' + queryParams.ts
  + '&api_key=' + queryParams.api_key
  + '&hash=' + queryParams.hash;

  console.log("URL is ", url);

  https.get(url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      const response = {
        statusCode: 200,
        body: convert.xml2json(data, {compact: true, spaces: 4}),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      };
    
      cb(null, response);
    });
 
  }).on("error", (err) => {
    const response = {
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message,
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  
    cb(null, response);
  });

  
}
