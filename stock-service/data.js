// -*- mode: JavaScript; -*-
import mongo from 'mongodb';



const dbUrl = (process.env.MONGO_URL !== undefined) ? process.env.MONGO_URL : "mongodb://localhost:27017/StockPrediction";
export default class StockService {
    constructor(props) {
        Object.assign(this, props)
    }

    /** options.dbUrl contains URL for mongo database */
    static async make() {
        // const dbUrl = "mongodb://localhost:27017/StockPrediction";
        let client;
        try {
            client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS );
            const db = client.db();
            const props = {
                client, db,
                intradayCollection: db.collection(QUOTES_INTRADAY),
                dailyCollection: db.collection(QUOTES_DAILY)
            };

            const data = new StockService(props);
            return data;
        }
        catch (err) {
            const msg = `cannot connect to URL "${dbUrl}": ${err}`;
            throw msg;
        }

    }

    async addIntraDayQuotes(data){
        try{
            const obj = { _id: data["Meta Data"]["2. Symbol"] };

            for (const [key, value] of Object.entries(data["Time Series (5min)"])) {
                obj[key] = value;
            }
            const sliceNum = (Object.keys(obj).length > 1000) ? 1000 : Object.keys(obj).length;
            const sliced = Object.keys(obj).slice(0, sliceNum).reduce((result, key) => {
                result[key] = obj[key];
                return result;
            }, {});
            const result = await this.intradayCollection.updateOne({_id: obj._id}, { $set: sliced }, {upsert : true});
            return sliced;
        }
        catch (e) {
            throw e;
        }
    }

    async addDailyQuotes(data){
        try{
            const obj = { _id: data["Meta Data"]["2. Symbol"] };

            for (const [key, value] of Object.entries(data["Time Series (Daily)"])) {
                obj[key] = value;
            }
            const sliceNum = (Object.keys(obj).length > 1000) ? 1000 : Object.keys(obj).length;
            const sliced = Object.keys(obj).slice(0, sliceNum).reduce((result, key) => {
                result[key] = obj[key];
                return result;
            }, {});
            const result = await this.dailyCollection.updateOne({_id: obj._id}, { $set: sliced }, {upsert : true});
            return sliced;
        }
        catch (e) {
            throw e;
        }
    }

async addUser(userDetails){
        try{
            userDetails._id = (Math.random() * 9999 + 1000).toFixed(4);
            const res = await this.intradayCollection.insertOne(userDetails);
        }
        catch (e) {
            throw e;
        }
    }


    async getStocks(){
        try{
            const arr = await this.intradayCollection.find({}).toArray();
            return arr;
        }
        catch (e) {
            throw e;
        }
    }

    async close() {
        await this.client.close();
    }

    /** Remove all data for this service */
    async clear() {
        await this.db.dropDatabase();
    }
}

const MONGO_CONNECT_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};
const QUOTES_INTRADAY = "intradayQuotes";
const QUOTES_DAILY = "dailyQuotes";
