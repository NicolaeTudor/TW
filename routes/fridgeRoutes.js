const express = require('express');
const fs = require('fs');

const fridgeRouter = express.Router();

const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
    h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

fridgeRouter.route('/')
            .get((req, res) => {
                var fridge = JSON.parse(fs.readFileSync('data/fridge.json'));
                res.send(fridge);
            });

fridgeRouter.route('/')
            .put((req, res) => {
                 //console.log(req.body);
                 var fridge = JSON.parse(fs.readFileSync('data/fridge.json'));
                 const productId = req.body.productId;
                 targetProduct = fridge.find(p =>  p.productId == productId);
                 if(targetProduct === undefined) { 
                     res.send(fridge);
                     return;
                 }
                 targetProduct.productName = req.body.productName;
                 targetProduct.productHash = cyrb53(req.body.productName);
                 targetProduct.qty = req.body.qty;
                 console.log(targetProduct);
                 fs.writeFileSync('data/fridge.json', JSON.stringify(fridge), () => {});
                 res.send(targetProduct);
            });

fridgeRouter.route('/')
            .post((req, res) => {
                var fridge = JSON.parse(fs.readFileSync('data/fridge.json'));
                let targetProduct = req.body;
                if(targetProduct === undefined) { 
                    res.send({});
                    return;
                }
                var newId;
                if(fridge.length == 0) {
                    newId = 1;
                }
                else {
                    newId = fridge[fridge.length -1].productId + 1;
                }

                targetProduct.productId = newId;
                targetProduct.productHash = cyrb53(req.body.productName);
                fridge.push(targetProduct);
                fs.writeFileSync('data/fridge.json', JSON.stringify(fridge), () => {});
                res.send(targetProduct);
            });

fridgeRouter.route('/')
            .delete((req, res) => {
                 var fridge = JSON.parse(fs.readFileSync('data/fridge.json'));
                 console.log(req.body);
                 const productId = req.body.productId;
                 fridge = fridge.filter(p =>  p.productId != productId);
                 fs.writeFileSync('data/fridge.json', JSON.stringify(fridge), () => {});
                 res.send(fridge);
            });


fridgeRouter.route('/addToFridge')
            .put((req, res) => {
                var fridge = JSON.parse(fs.readFileSync('data/fridge.json'));
                for(let i = 0; i < req.body.productList.length; i++)
                {
                    console.log(req.body)
                    const productName = req.body.productList[i].productName;
                    const productHash = cyrb53(productName);
                    const qty = parseInt(req.body.productList[i].qty);
                    let newId;
                    targetProduct = fridge.find(p =>  p.productHash == productHash && p.productName == productName);
                    if(targetProduct === undefined) {
                        if(fridge.length == 0)
                            newId = 1;
                        else {
                            newId = fridge[fridge.length -1].productId + 1;
                        }
                        const newProduct = {
                            productName: productName,
                            qty: qty,
                            productId: newId,
                            productHash: productHash
                        }
                        fridge.push(newProduct);
                    }
                    else {
                        targetProduct.qty += qty;
                        console.log(targetProduct);
                    }
                }

                fs.writeFileSync('data/fridge.json', JSON.stringify(fridge), () => {});
                res.send(fridge);              
            });

module.exports = fridgeRouter;