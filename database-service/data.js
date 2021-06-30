// -*- mode: JavaScript; -*-
import mongo from 'mongodb';

const dbUrl = (process.env.MONGO_URL !== undefined) ? process.env.MONGO_URL : "mongodb://localhost:27017/StockPrediction";
console.log(dbUrl)


export default class DatabaseService {
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
                stocksCollection: db.collection(STOCKS)
            };

            const data = new DatabaseService(props);
            return data;
        }
        catch (err) {
            const msg = `cannot connect to URL "${dbUrl}": ${err}`;
            throw msg;
        }

    }

    /** Release all resources held by this blog.  Specifically, close
     *  any database connections.
     */
    async addUser(userDetails){
        const result = await this.stocksCollection.findOne({Firstname: userDetails.Firstname});
        try{
            userDetails._id = (result) ? result._id : (Math.random() * 9999 + 1000).toFixed(4);
            // userDetails.Stocks
            const userInfo = {...userDetails, ...result};
            const mergedStocks = {};
            if(result){
                Object.keys(result.Stocks).concat(Object.keys(userDetails.Stocks))
                    .forEach(k => mergedStocks[k] = k in userDetails.Stocks ? userDetails.Stocks[k] : result.Stocks[k]);
                userInfo.Stocks = mergedStocks;
            }

            const res = await this.stocksCollection.updateOne({_id:userInfo._id}, {$set: userInfo }, { upsert: true });
        }
        catch (e) {
            throw e;
        }
    }

    async addUserStock(userDetails){
        const result = await this.stocksCollection.findOne({Firstname: userDetails.Firstname});
        try{
            if(result){
                 result.Stocks[[userDetails.stock]] = userDetails.shares;
                const obj = Object.assign({}, result);
                const res = await this.stocksCollection.updateOne( {_id:result._id}, { $set: obj }, { upsert: true });
            }
            else {
                throw "NOT_FOUND: User not found";
            }
        }
        catch (e) {
            throw e;
        }
    }

    async getStocks(){
        try{
            const arr = await this.stocksCollection.find({}).toArray();
            return arr;
        }
        catch (e) {
            throw e;
        }
    }

    async getUserStocks(userDetails){
        try{
            const result = await this.stocksCollection.findOne(userDetails, { projection: { _id: 0 } });
            result.Name = `${result.Firstname} ${result.Lastname}`;
            delete result.Firstname; delete result.Lastname;
            return result;
        }
        catch(e) {
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
const STOCKS = "stocks";