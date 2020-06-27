const express = require('express');
const fs = require('fs');

const recipesRouter = express.Router();

//a random integer in the range [0, max)
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}  

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

recipesRouter.route('/')
    .get((req, res) => {
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        var resumed = [];
        for (let i = 0; i < recipes.length; i++) {
            var resumedRecipe = {
                recipeId: recipes[i].recipeId,
                title: recipes[i].title,
                author: recipes[i].author,
                description: recipes[i].mini_description,
                image: recipes[i].image
            }

            resumed.push(resumedRecipe);
        }
        res.send(resumed);
    });

recipesRouter.route('/')
    .put((req, res) => {
        //console.log(req.body);
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        const productId = req.body.productId;
        targetProduct = recipes.find(p => p.productId == productId);
        if (targetProduct === undefined) {
            res.send(recipes);
            return;
        }
        targetProduct.productName = req.body.productName;
        targetProduct.productHash = cyrb53(req.body.productName);
        targetProduct.qty = req.body.qty;
        console.log(targetProduct);
        fs.writeFileSync('data/recipes.json', JSON.stringify(recipes), () => { });
        res.send(targetProduct);
    });

recipesRouter.route('/')
    .post((req, res) => {
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        let targetProduct = req.body;
        if (targetProduct === undefined) {
            res.send({});
            return;
        }
        var newId;
        if (recipes.length == 0) {
            newId = 1;
        }
        else {
            newId = recipes[recipes.length - 1].productId + 1;
        }

        targetProduct.productId = newId;
        targetProduct.productHash = cyrb53(req.body.productName);
        recipes.push(targetProduct);
        fs.writeFileSync('data/recipes.json', JSON.stringify(recipes), () => { });
        res.send(targetProduct);
    });

recipesRouter.route('/')
    .delete((req, res) => {
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        console.log(req.body);
        const productId = req.body.productId;
        recipes = recipes.filter(p => p.productId != productId);
        fs.writeFileSync('data/recipes.json', JSON.stringify(recipes), () => { });
        res.send(recipes);
    });


recipesRouter.route('/addToGroceryList')
    .put((req, res) => {
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        for (let i = 0; i < req.body.productList.length; i++) {
            console.log(req.body)
            const productName = req.body.productList[i].productName;
            const productHash = cyrb53(productName);
            const qty = parseInt(req.body.productList[i].qty);
            let newId;
            targetProduct = recipes.find(p => p.productHash == productHash && p.productName == productName);
            if (targetProduct === undefined) {
                if (recipes.length == 0)
                    newId = 1;
                else {
                    newId = recipes[recipes.length - 1].productId + 1;
                }
                const newProduct = {
                    productName: productName,
                    qty: qty,
                    productId: newId,
                    productHash: productHash
                }
                recipes.push(newProduct);
            }
            else {
                targetProduct.qty += qty;
                console.log(targetProduct);
            }
        }

        fs.writeFileSync('data/recipes.json', JSON.stringify(recipes), () => { });
        res.send(recipes);
    });


recipesRouter.route('/fortuneCookie')
    .get((req, res) => {
        var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
        var fortuneCookies = JSON.parse(fs.readFileSync('data/fortuneCookies.json'));
        let randomRecipe = recipes[getRandomInt(recipes.length)];
        let randomfortuneCookie = fortuneCookies[getRandomInt(fortuneCookies.length)];

        console.log(randomRecipe);
        console.log(randomfortuneCookie);

        let send = {result: randomfortuneCookie.prediction + randomRecipe.title + randomfortuneCookie.punctuation};
        console.log(send);
        res.send({result: randomfortuneCookie.prediction + randomRecipe.title + randomfortuneCookie.punctuation});        
    });

module.exports = recipesRouter;