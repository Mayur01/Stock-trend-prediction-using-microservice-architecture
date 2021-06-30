#!/usr/bin/env nodejs

import assert from 'assert';

import webServices from './database-ws.mjs';
import Data from './data.js';

async function go() {
    try {
        const port = 3000;
        const blog = await Data.make();
        webServices(port, blog);
    }
    catch (err) {
        console.error(err);
    }
}

go();