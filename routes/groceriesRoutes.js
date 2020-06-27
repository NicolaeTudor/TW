const express = require('express');
const fs = require('fs');

const groceriesRouter = express.Router();

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


groceriesRouter.route('/')
               .get((req, res) => {
                    var groceryList = JSON.parse(fs.readFileSync('data/groceryList.json'));
                    res.send(groceryList);
               });

groceriesRouter.route('/')
               .put((req, res) => {
                    //console.log(req.body);
                    var groceryList = JSON.parse(fs.readFileSync('data/groceryList.json'));
                    const productId = req.body.productId;
                    targetProduct = groceryList.find(p =>  p.productId == productId);
                    if(targetProduct === undefined) { 
                        res.send(groceryList);
                        return;
                    }
                    targetProduct.productName = req.body.productName;
                    targetProduct.productHash = cyrb53(req.body.productName);
                    targetProduct.qty = req.body.qty;
                    targetProduct.productObtained = req.body.productObtained;
                    console.log(targetProduct);
                    fs.writeFileSync('data/groceryList.json', JSON.stringify(groceryList), () => {});
                    res.send(targetProduct);
               });

groceriesRouter.route('/')
               .delete((req, res) => {
                    var groceryList = JSON.parse(fs.readFileSync('data/groceryList.json'));
                    console.log(req.body);
                    const productId = req.body.productId;
                    groceryList = groceryList.filter(p =>  p.productId != productId);
                    fs.writeFileSync('data/groceryList.json', JSON.stringify(groceryList), () => {});
                    res.send(groceryList);
               });

groceriesRouter.route('/')
               .post((req, res) => {
                    var groceryList = JSON.parse(fs.readFileSync('data/groceryList.json'));
                    let targetProduct = req.body;
                    if(targetProduct === undefined) { 
                        res.send({});
                        return;
                    }
                    console.log('eh');
                    var newId;
                    if(groceryList.length == 0) {
                        newId = 1;
                    }
                    else {
                        newId = groceryList[groceryList.length -1].productId + 1;
                    }
    
                    targetProduct.productId = newId;
                    targetProduct.productHash = cyrb53(req.body.productName);
                    groceryList.push(targetProduct);
                    fs.writeFileSync('data/groceryList.json', JSON.stringify(groceryList), () => {});
                    res.send(targetProduct);
               });

groceriesRouter.route('/reset')
               .post((req, res) => {
                    console.log("huh?");
                    fs.writeFileSync('data/groceryList.json', JSON.stringify([]), () => {});
                    res.send({});
               });

groceriesRouter.route('/addFromRecipe')
               .post((req, res) => {
                   console.log("a miracle!");
                    var groceryList = JSON.parse(fs.readFileSync('data/groceryList.json'));
                    let targetRecipeId = req.body.recipeId;
                    var recipes = JSON.parse(fs.readFileSync('data/recipes.json'));
                    var targetRecipe = recipes.find(r => r.recipeId == targetRecipeId);
                    var targetRecipeGroceryList = targetRecipe.ingredients;
                    for( let i = 0; i < targetRecipeGroceryList.length; i++)
                    {
                        //we'll see
                        let targetProduct = targetRecipeGroceryList[i];                        
                        targetProduct.productObtained = false;
                        var newId;
                        if(groceryList.length == 0) {
                            newId = 1;
                        }
                        else {
                            newId = groceryList[groceryList.length -1].productId + 1;
                        }
        
                        targetProduct.productId = newId;
                        console.log(targetProduct);
                        groceryList.push(targetProduct);
                    }
                    
                    fs.writeFileSync('data/groceryList.json', JSON.stringify(groceryList), () => {});
                    res.send({});
               });

module.exports = groceriesRouter;