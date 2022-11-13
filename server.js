const rxjs = require("rxjs");

const myPromise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log("I am resolved - 1");
    }, 1000);
});

const myPromise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log("I am resolved - 2");
    }, 3000);
});

const myPromise3 = new Promise((resolve, reject) => {
    reject('I am rejected!');
});

// single promise //
// promise.then(res => console.log(res));

// promise all //
// Promise.all([myPromise1, myPromise2, myPromise3]).then(res => {
//     console.log({ res });
// })

// promise settle all //
Promise.allSettled([myPromise1, myPromise2, myPromise3]).then(all => {
    all.forEach(each => console.log({ each }))
})

const myObserver = new rxjs.Observable(observer => {
    setTimeout(() => {
        console.log('hi')
        console.log('hello')
        console.log('hey')
    }, 1000);
});

myObserver.subscribe(res => console.log(res));

