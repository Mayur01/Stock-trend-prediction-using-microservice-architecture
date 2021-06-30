import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import * as alphaModel from './alpha.mjs';
import * as stockInfoModel from './stock-info.mjs';

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;


export default function serve(port, model) {
    const app = express();
    app.locals.port = port;
    app.locals.model = model;
    setupRoutes(app);

    app.listen(port, function() {
        console.log(`listening on port ${port}`);
    });
}


function setupRoutes(app) {
    app.use(cors());
    app.use(bodyParser.json());

    app.get('/getIntraDayQuotes/:symbol', getIntraDayQuotes(app));
    app.get('/getDailyQuotes/:symbol', getDailyQuotes(app));
    app.get(`/getSingleStockInfo/:symbol`, getSingleStockInfo(app));

    app.use(do404());
    app.use(doErrors());
}

/****************************** Handlers *******************************/
function getSingleStockInfo(app){
    return errorWrap(async function (req, res){
        try{
            const symbol = req.params.symbol;
            const stockInfoData = await stockInfoModel.getSingleStockInfo(symbol);
            const data = {
                region: stockInfoData.region,
                quoteType: stockInfoData.quoteType,
                currency: stockInfoData.currency,
                fullExchangeName: stockInfoData.fullExchangeName,
                financialCurrency: stockInfoData.financialCurrency,
                regularMarketOpen: stockInfoData.regularMarketOpen,
                fiftyTwoWeekLow: stockInfoData.fiftyTwoWeekLow,
                fiftyTwoWeekHigh: stockInfoData.fiftyTwoWeekHigh,
                regularMarketPrice: stockInfoData.regularMarketPrice,
                regularMarketDayHigh: stockInfoData.regularMarketDayHigh,
                regularMarketDayLow: stockInfoData.regularMarketDayLow,
                regularMarketVolume: stockInfoData.regularMarketVolume,
                shortName: stockInfoData.shortName,
                longName: stockInfoData.longName,
                exchangeTimezoneName: stockInfoData.exchangeTimezoneName,
                exchangeTimezoneShortName: stockInfoData.exchangeTimezoneShortName,
                market: stockInfoData.market,
                displayName: stockInfoData.displayName,
                symbol: stockInfoData.symbol
            };
            res.json(data);
        }
        catch(err){
            const mapped = mapError(err);
            res.status(mapped.status).json(mapped);
        }
    });
}

function getIntraDayQuotes(app){
    return errorWrap(async function (req, res){
        try{
            const symbol = req.params.symbol;
            const alphaData = await alphaModel.getIntraDayQuotes(symbol);
            const data = await app.locals.model.addIntraDayQuotes(alphaData);
            res.json(data);
        }
        catch(err){
            const mapped = mapError(err);
            res.status(mapped.status).json(mapped);
        }
    });
}

function getDailyQuotes(app){
    return errorWrap(async function (req, res){
        try{
            const symbol = req.params.symbol;
            const alphaData = await alphaModel.getDailyQuotes(symbol);
            const data = await app.locals.model.addDailyQuotes(alphaData);
            res.json(data);
        }
        catch(err){
            const mapped = mapError(err);
            res.status(mapped.status).json(mapped);
        }
    });
}



/**************************** Error Handling ***************************/

/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */
function do404(app) {
    return async function(req, res) {
        const message = `${req.method} not supported for ${req.originalUrl}`;
        const result = {
            status: NOT_FOUND,
            errors: [	{ code: 'NOT_FOUND', message, }, ],
        };
        res.type('text').
        status(404).
        json(result);
    };
}

function doErrors(app) {
    return async function(err, req, res, next) {
        const result = {
            status: SERVER_ERROR,
            errors: [ { code: 'SERVER_ERROR', message: err.message } ],
        };
        res.status(SERVER_ERROR).json(result);
        console.error(err);
    };
}

/** Set up error handling for handler by wrapping it in a
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
}

const ERROR_MAP = {
    NOT_FOUND: NOT_FOUND,
    EXISTS: CONFLICT,
};

function mapError(err) {
    console.error(err);
    return err.isDomain
        ? {
            status: (ERROR_MAP[err.errorCode] || BAD_REQUEST),
            code: err.errorCode,
            message: err.message
        }
        : {
            status: SERVER_ERROR,
            code: 'INTERNAL',
            message: err.toString()
        };
}