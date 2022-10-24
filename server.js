const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const cheerio = require('cheerio');
const validUrl = require('valid-url');


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
    return `<li>${title}</li>`;
}

function validity(urls) {
    return urls.map(url => {
        if (validUrl.isUri(url)){
            return { url, isValid: true }
        }
        
        return { url, isValid: false }
    });
}

// apis

app.get('/', (req, res) => {
    res.send('Home');
});

app.get('/I/want/title', async (req, res) => {
    const { address } = req.query;

    //check for url validity
    if(Array.isArray(address)) {
        const validatedURLS = validity(address);

        const allThePromises = validatedURLS.map(url => url.isValid ? getTitleOfAddress(url.url) : new Promise((resolve, reject) => reject('Invalid URL')));
        Promise.allSettled(allThePromises).then(titles => {
            // console.log(titles[0].value.data)
            titles.map(each => {
                if(each.status === 'fulfilled') {
                let dump = [];
                dump.push(each.value.data);

                let all = [];
                for(let i=0; i<dump.length; i++) {
                    let each = dump[i];
                    all.push(scrapeTitle(each));
                }

                console.log(all)

                // res.send(`
                //     <html>
                //     <head></head>
                //     <body>
                //         <h1> Following are the titles of given websites: </h1>

                //         <ul>
                //             ${tb.map(title => (
                //                 `<li>${title}</li>`
                //             ))}
                //         </ul>
                //     </body>
                //     </html>
                // `)
                }
            })
            const tt = scrapeTitle(titles[0].value.data);
        });
    }
    //  else {
    //     getTitleOfAddress(address);
    // }

    // res.send(`
    //     <html>
    //     <head></head>
    //     <body>
    //         <h1> Following are the titles of given websites: </h1>

    //         <ul>
    //             ${titles?.map(title => (
    //                 `<li>${title}</li>`
    //             ))}
    //         </ul>
    //     </body>
    //     </html>
    // `)


});


// all other routes will respond with 404
app.get('*', (req, res) => {
    res.status(404).send('Not found!');
});

app.listen(3000, () => console.log('Server has started'));








// if(Array.isArray(address)) {
//     res.send(`
//     <html>
//     <head></head>
//     <body>
//         <h1> Following are the titles of given websites: </h1>

//         <ul>
//             ${address.map(eachAddress => (
//                 `<li>${eachAddress}</li>`
//             ))}
//         </ul>
//     </body>
//     </html>
//     `)
// } else {
//     res.send(`
//     <html>
//     <head></head>
//     <body>
//         <h1> Following are the titles of given websites: </h1>

//         <ul>
//             <li>${address}</li>
//         </ul>
//     </body>
//     </html>
//     `)
// }