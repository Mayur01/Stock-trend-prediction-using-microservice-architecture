import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

import path from 'path';
const __dirname = path.resolve();
const __dirPath = `${__dirname}/views`;


const DB_URL = (process.env.USERS_URL !== undefined) ? process.env.USERS_URL : "http://localhost:3000";
const STOCKS_URL = (process.env.STOCKS_URL !== undefined) ? process.env.STOCKS_URL : "http://localhost:4000";
const port = 5000;
// const DB_URL = `http://34.66.138.117:3000`;
// const STOCKS_URL = `http://localhost:4000`;


const app = express();
app.locals.port = port;
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/views', express.static('views'));
app.set('view engine', 'ejs');
// app.use('/views', express.static('views'));
// app.use(express.static('views'));

app.listen(port, function() {
    console.log(`listening on port ${port}`);
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', home(app));
app.get('/index', home(app));
app.get(`/userDetails`, userDetails(app));
app.get(`/stocks`, stockInfo(app));
// app.get(`/getURLs`, getURLs(app));

/****************************** Handlers *******************************/
function home(app){
    return errorWrap(async function (req, res){
        try{
            const userInfo = await axios.get(`${DB_URL}/getStocks`);
            res.render(`index`, {results: userInfo.data, db_url: DB_URL});
            // res.sendFile(`${__dirPath}/index.ejs`);
        }
        catch(err){
            console.error(err);
            throw err;
        }
    });
}

function userDetails(app){
    try{
        return errorWrap(async function (req, res){
            const firstName = req.query.Firstname;
            const result = await axios.get(`${DB_URL}/getUserStocks?Firstname=${firstName}`);
            res.render(`userDetails`, {results: result.data, firstname: firstName});
            // res.sendFile(`${__dirPath}/userDetails.ejs`);
        });
    }
    catch(err){
        console.error(err);
        throw err;
    }
}

function stockInfo(app){
    try{
        return errorWrap(async function (req, res){
            const firstName = req.query.Firstname;
            const symbol = req.query.stockname;

            const db_result = await axios.get(`${DB_URL}/getUserStocks?Firstname=${firstName}`);

            const stock_meta_result = await axios.get(`${STOCKS_URL}/getSingleStockInfo/${symbol}`);
            const result_chart1 = await axios.get(`${STOCKS_URL}/getIntraDayQuotes/${symbol}`);
            const chart1_data = result_chart1.data;
            delete chart1_data._id;
            const result_chart2 = await axios.get(`${STOCKS_URL}/getDailyQuotes/${symbol}`);
            const chart2_data = result_chart2.data;
            delete chart2_data._id;

            // const prediction_url = `http://34.66.138.117:5050`;
            // const result_chart3 = await axios.get(`${prediction_url}/predict?id=${symbol}`);
            // const chart3_data = result_chart3.data;
            // delete chart3_data._id;

            const model = {
                results: db_result.data,
                firstname: firstName,
                symbol: symbol,
                stockMetadata: stock_meta_result.data,
                chart1_data: chart1_data,
                chart2_data: chart2_data,
                // chart3_data: chart3_data
            };
            res.render(`stocks`, model);
            // res.sendFile(`${__dirPath}/stocks.html`);
        });
    }
    catch(err){
        console.error(err);
        throw err;
    }
}

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