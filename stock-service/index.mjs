#!/usr/bin/env nodejs
import Data from './data.js';
import webServices from './stock-ws.mjs';


async function go() {
    try {
        const port = 4000;
        const quote = await Data.make();
        webServices(port, quote);
    }
    catch (err) {
        console.error(err);
    }
}

go();