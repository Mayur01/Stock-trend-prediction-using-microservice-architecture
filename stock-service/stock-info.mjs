import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const stock_info = require('stock-info');


export async function getSingleStockInfo(symbol){
    try{
        const stock_data = await stock_info.getSingleStockInfo(symbol);
        return stock_data;
    }
    catch(err){
        throw err;
    }
}
