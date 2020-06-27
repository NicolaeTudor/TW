const mainSpace = document.getElementById("mainSpace");
const recipesBtn = document.getElementById("recipesBtn");
const groceryBtn = document.getElementById("groceriesBtn");
const url = '/recipe';

document.body.onload = initPage;
recipesBtn.onclick = initializeRecipePage;

function initPage()
{
    let fortuneCookie = document.getElementById("fortuneCookie");
    fetch(url + '/fortuneCookie')
    .then((resp) => resp.json())
    .then((data) => {
        console.log(data);
        fortuneCookie.textContent = data.result;
    });
    initializeRecipePage();
}

function getRecipes()
{   
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
    console.log(data);
    let recipes = data;
    return recipes.map(function(recipe) {
        var divRecipe = document.createElement('section');
        var divText = document.createElement('div');
        var titleRecipe = document.createElement('span');
        var authorRecipe = document.createElement('span');
        var imgRecipe = document.createElement('img');
        var descRecipe = document.createElement('p');
        var fullRecipeBtn = document.createElement('button');
        divText.classList.add('recipeText');
        divRecipe.classList.add('recipeSection');
        titleRecipe.classList.add('recipeTitle');
        authorRecipe.classList.add('recipeAuthor');
        descRecipe.classList.add('recipeDescription');
        imgRecipe.classList.add('recipePhoto');
        fullRecipeBtn.classList.add('recipeFullBtn');
        fullRecipeBtn.innerHTML = "Move to grocery list";
        fullRecipeBtn.value = recipe.recipeId;
        fullRecipeBtn.addEventListener('click', sendToGroceryList);
        titleRecipe.innerHTML = recipe.title;
        authorRecipe.innerHTML = recipe.author;
        descRecipe.innerHTML = recipe.description;
        imgRecipe.src = recipe.image;
        divRecipe.appendChild(imgRecipe);
        divText.appendChild(titleRecipe);
        divText.appendChild(authorRecipe);
        divText.appendChild(descRecipe);
        divText.appendChild(fullRecipeBtn);
        divRecipe.appendChild(divText);
        mainSpace.appendChild(divRecipe);
    })
    })
    .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
    });  
}

function initializeRecipePage()
{
    while (mainSpace.firstChild) {
        mainSpace.removeChild(mainSpace.lastChild);
    }

    mainSpace.classList.remove(...mainSpace.classList);
    mainSpace.classList.add("recipeSpace");
    getRecipes();
}

function sendToGroceryList()
{
    const recipeId = this.value;
    fetch('/groceryList/addFromRecipe', {
        method: 'post',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({recipeId : recipeId})
    })
    .then(function(){
        //groceryBtn.click();
    })
    .catch(function(error) {
        console.log('oh no!:(');
        console.log(JSON.stringify(error));
    });  
}