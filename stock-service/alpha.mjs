import { createRequire } from 'module';
const require = createRequire(import.meta.url);
/**
 * Init Alpha Vantage with your API key.
 *
 * @param {String} key
 *   Your Alpha Vantage API key.
 */
const API_KEY = "4TIO4KLV3YZPT1HW";
const alpha = require('alphavantage')({ key: API_KEY });

export async function getIntraDayQuotes(symbol){
    try{
        const intraDayQuotes = await alpha.data.intraday(symbol, `compact`, `json`, `5min`);
        return intraDayQuotes;
    }
    catch(err){
        throw err;
    }
}

export async function getDailyQuotes(symbol){
    try{
        const dailyQuotes = await alpha.data.daily(symbol, `full`,`json`);
        return dailyQuotes;
    }
    catch(err){
        throw err;
    }
}

