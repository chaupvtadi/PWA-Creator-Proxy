import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { environment } from './evironment';

const https = require('https');
const convert = require('xml-js');
const sha1 = require('sha1');

export const getSlides: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {

  let queryParams = event.queryStringParameters;
  let ts = Math.round((new Date()).getTime() / 1000);
  let api_key = environment.slideshare.api_key;
  let hash = sha1(environment.slideshare.secret_key + ts);

  let url = 'https://www.slideshare.net/api/2/get_slideshows_by_user?username_for=' + queryParams.username_for
  + '&ts=' + ts
  + '&api_key=' + api_key
  + '&hash=' + hash;

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

export const getMediumPosts: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  let queryParams = event.queryStringParameters;
  const url = `https://medium.com/${queryParams.mediumUsername}/latest?format=json`;

  https.get(url, (resp) => {
    let data: any;

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      data = data.substr(data.indexOf('{'));
      data = JSON.parse(data) || {};

      if (data && data.payload) {
        data = JSON.stringify(data.payload);
      } else {
        data = JSON.stringify({});
      }

      const response = {
        statusCode: 200,
        body: data,
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