const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const cheerio = require('cheerio');
const validUrl = require('valid-url');
const { combineLatest } = require('rxjs');


const app = express();

app.use(morgan('dev'));

// funciton

function getTitleOfAddress(url) {
    return axios.request({
        method: "GET",
        headers: {
            'Content-Type': 'text/plain'
        },
        url: url
    });
}

function scrapeTitle(body) {
    const $ = cheerio.load(body);
    const title = $('title').html();
    return `${title}`;
}

function validity(urls) {
    return urls.map(url => {
        if (validUrl.isUri(url)){
            return { url, isValid: true }
        }
        return { url, isValid: false }
    });
}

function sendResponseHTML(url, title) {
    return `
        <html>
        <head></head>
        <body>
            <h1> Following are the titles of given websites: </h1>
    
            <ul>
            <li>${url} - ${title}</li>
            </ul>
        </body>
        </html>`
}

// apis

app.get('/', (req, res) => {
    res.send('Home');
});

app.get('/I/want/title', async (req, res) => {
    const { address } = req.query;

    let all = [];
    //check for url validity
    if(Array.isArray(address)) {
        const validatedURLS = validity(address);

        const allThePromises = validatedURLS.map(url => url.isValid ? getTitleOfAddress(url.url) : new Promise((resolve, reject) => reject('Invalid URL')));
        Promise.allSettled(allThePromises).then(titles => {
            res.send(`
                <html>
                <head></head>
                <body>
                    <h1> Following are the titles of given websites: </h1>

                    <ul>
                        ${titles.map(each => {
                            if(each.status === 'fulfilled') {
                                let iTitle = scrapeTitle(each.value.data);
                                return `<li> ${each.value.config.url} - ${iTitle}</li>`
                            } else {
                                return `<li>Invalid URL - NO RESPONSE</li>`
                            }
                        })}                        
                    </ul>
                </body>
                </html>
            `)
        })
    } else {
        if(validUrl.isUri(address)) {
            getTitleOfAddress(address)
            .then(data => {
                const iTitle = scrapeTitle(data.data);
                const url = data.config.url;
                res.send(sendResponseHTML(url, iTitle))
            })
        } else {
            res.send('Invalid URL - NO RESPONSE');
        }
    }

});








// rxjs

// const useRxjs = (promises) => {
//     let allTitles =  combineLatest(promises).subscribe((value) => value.map(each => {
//         let title = scrapeTitle(each.data);
//         sendResRxjs(title);
//     }));
// }
// const sendResRxjs = (title) => {
//     return `
//             <html>
//             <head></head>
//             <body>
//                 <h1> Following are the titles of given websites: </h1>

//                 <ul>
//                     <li>${title}</li>                   
//                 </ul>
//             </body>
//             </html>
//             `
// }

app.get('/I/want/titler', async (req, res) => {
    const { address } = req.query;

    let all = [];
    //check for url validity
    if(Array.isArray(address)) {
        const validatedURLS = validity(address);

        const allThePromises = validatedURLS.map(url => url.isValid ? getTitleOfAddress(url.url) : new Promise((resolve, reject) => reject('Invalid URL')));

        combineLatest(allThePromises)
            .subscribe(value => {
                res.send(`
                    <html>
                    <head></head>
                    <body>
                        <h1> Following are the titles of given websites: </h1>
                        <ul>
                            <li>${value.map(each => scrapeTitle(each.data))}</li>
                        </ul>
                    </body>
                    </html>
                `);
            })

    } else {
        if(validUrl.isUri(address)) {
            getTitleOfAddress(address)
            .then(data => {
                const iTitle = scrapeTitle(data.data);
                const url = data.config.url;
                res.send(sendResponseHTML(url, iTitle))
            })
        } else {
            res.send('Invalid URL - NO RESPONSE');
        }
    }

});






// all other routes will respond with 404
app.get('*', (req, res) => {
    res.status(404).send('Not found!');
});

app.listen(3000, () => console.log('Server has started'));