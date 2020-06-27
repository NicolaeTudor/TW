const mainSpace = document.getElementById("mainSpace");
const asideSpace = document.getElementById("asideSpace");
const groceryBtn = document.getElementById("groceriesBtn");
const fridgeBtn = document.getElementById("fridgeBtn");
let groceryList;
const url = '/groceryList';

groceryBtn.onclick = initializeGroceryList;

function newProduct() {
  var li = document.createElement('li');
  var inputQty = document.createElement('input');
  var inputName = document.createElement('input');
  var checkbox = document.createElement('input');

  checkbox.type = 'checkbox';
  checkbox.classList.add('listProductObtained');
  checkbox.addEventListener('change', createProduct);
  inputName.classList.add('listProductName');
  inputName.addEventListener('change', createProduct);
  inputQty.type = 'number';
  inputQty.classList.add('listProductQty');
  inputQty.addEventListener('change', createProduct);
  li.appendChild(checkbox);
  li.appendChild(inputName);
  li.appendChild(inputQty);
  groceryList.appendChild(li);
}

function deleteProduct(targetProduct)
{
  const productId = targetProduct.value;
  const objDelete = {productId : productId};
  fetch(url, {
    method: 'delete',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(objDelete)
  })
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
    console.log(targetProduct);
  })
  .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
  });

  const previousProduct = targetProduct.previousSibling;
  groceryList.removeChild(targetProduct);

  return previousProduct;
}

function moveObtainedProductsToFridge()
{
  console.log("Im freezing!");
  let targetProduct = groceryList.firstChild;
  let productsToMove = [];
  while(targetProduct != null)
  {  
    const productObtained = targetProduct.getElementsByClassName('listProductObtained')[0].checked;
    if(productObtained == true)
    {
      const productName = targetProduct.getElementsByClassName('listProductName')[0].value;
      const productQty = parseInt(targetProduct.getElementsByClassName('listProductQty')[0].value);
    
      const updatedProduct = {
        productName: productName,
        productObtained : productObtained,
        qty : productQty
      };
      productsToMove.push(updatedProduct);
      //console.log(updatedProduct);
      targetProduct = deleteProduct(targetProduct);
    }
    if(targetProduct != null) {
      targetProduct = targetProduct.nextSibling;
    }
    else {
      targetProduct = groceryList.firstChild;
    }
  }
  const objPut = {productList : productsToMove};
  console.log(productsToMove.length);
  if(productsToMove.length > 0) {
    fetch('/fridge/addToFridge', {
      method: 'put',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objPut)
    })
    .then((resp) => resp.json())
    .then(function(data) {
      console.log(data);
      fridgeBtn.click();
    })
    .catch(function(error) {
      console.log('oh no!:(');
      console.log(JSON.stringify(error));
    });
  }
}

function updateProduct () {
  const product =  this.parentElement;
  const productId = parseInt(product.value);
  const productName = product.getElementsByClassName('listProductName')[0].value;
  const productQty = parseInt(product.getElementsByClassName('listProductQty')[0].value);
  const productObtained = product.getElementsByClassName('listProductObtained')[0].checked;

  if(productName == '' || isNaN(parseInt(productQty)))
  {
    console.log('maybe...');
    return;
  }

  const updatedProduct = {
    productId : productId,
    productName: productName,
    productObtained : productObtained,
    qty : productQty
  }

  console.log(updatedProduct);
  
  fetch(url, {
    method: 'put',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProduct)
  })
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
  })
  .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
  });
}

function createProduct () {
  let product =  this.parentElement;
  //const productId = parseInt(product.value);
  const productNameInput = product.getElementsByClassName('listProductName')[0];
  const productQtyInput = product.getElementsByClassName('listProductQty')[0];
  const productObtainedCheckbox = product.getElementsByClassName('listProductObtained')[0];

  if(productNameInput.value == '' || isNaN(parseInt(productQtyInput.value)))
  {
    console.log('maybe...');
    return;
  }

  const newPostProduct = {
    productName: productNameInput.value,
    productObtained : productObtainedCheckbox.checked,
    qty : productQtyInput.value
  }

  console.log(newPostProduct);
  
  fetch(url, {
    method: 'post',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPostProduct)
  })
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
    product.value = data.productId;
    productNameInput.removeEventListener('change', createProduct);
    productQtyInput.removeEventListener('change', createProduct);
    productObtainedCheckbox.removeEventListener('change', createProduct);
    productNameInput.addEventListener('change', updateProduct);
    productQtyInput.addEventListener('change', updateProduct);
    productObtainedCheckbox.addEventListener('change', updateProduct);
  })
  .catch(function(error) {
     console.log('oh no!:(');
     console.log(JSON.stringify(error));
  });

  newProduct();
}

function getGroceries () {
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
    let groceries = data;
    return groceries.map(function(grocery) {
      var li = document.createElement('li');
      var inputQty = document.createElement('input');
      var inputName = document.createElement('input');
      var checkbox = document.createElement('input');

      li.value= grocery.productId;
      checkbox.type = 'checkbox';
      checkbox.checked = grocery.productObtained;
      checkbox.classList.add('listProductObtained');
      checkbox.addEventListener('change', updateProduct);
      inputName.value = grocery.productName;
      inputName.classList.add('listProductName');
      inputName.addEventListener('change', updateProduct);
      inputQty.type = 'number';
      inputQty.value = grocery.qty;
      inputQty.classList.add('listProductQty');
      inputQty.addEventListener('change', updateProduct);
      li.appendChild(checkbox);
      li.appendChild(inputName);
      li.appendChild(inputQty);
      groceryList.appendChild(li);
    })
  })
  .then(()=>{newProduct()})
  .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
  });  
}

function resetList()
{
  fetch(url + '/reset', {
    method: 'post',
    headers: { "Content-Type": "application/json" }
  })
  .then(() => {
    initializeGroceryList();
  })
  .catch(function(error) {
     console.log('oh no!:(');
     console.log(JSON.stringify(error));
  });

}

function initializeGroceryList()
{
  while (groceryList != null && groceryList.firstChild) {
    groceryList.removeChild(groceryList.lastChild);
  }

  while (mainSpace.firstChild) {
      mainSpace.removeChild(mainSpace.lastChild);
  }
  
  mainSpace.classList.remove(...mainSpace.classList);
  mainSpace.classList.add("grocerySpace");
  let groceryListSection = document.createElement('section');
  groceryListSection.classList.add("groceryListSection");
  groceryList = document.createElement('ul');
  groceryList.classList.add("groceryList");

  groceryListSection.appendChild(groceryList);
  var moveToFridgeBtn = document.createElement('button');
  moveToFridgeBtn.textContent = 'move to Fridge';
  moveToFridgeBtn.addEventListener('click', moveObtainedProductsToFridge);
  var resetListBtn = document.createElement('button');
  resetListBtn.textContent = 'reset List';
  resetListBtn.addEventListener('click', resetList);
  groceryListSection.appendChild(moveToFridgeBtn);
  groceryListSection.appendChild(resetListBtn);
  mainSpace.appendChild(groceryListSection);
  getGroceries();
}