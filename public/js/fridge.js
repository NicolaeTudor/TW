const asideSpace = document.getElementById("asideSpace");
const fridgeBtn = document.getElementById("fridgeBtn");
let fridge;
const url = '/fridge';

fridgeBtn.onclick = initializeFridge;

function deleteProduct(el) {
  const product =  el.parentElement;
  const productId = parseInt(product.value);
  const objDelete = {productId : productId};

  fetch(url, {
    method: 'delete',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(objDelete)
  })
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
  })
  .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
  });

  fridge.removeChild(product);
}

function updateProduct () {
  const product =  this.parentElement;
  const productId = parseInt(product.value);
  const productName = product.getElementsByClassName('listProductName')[0].value;
  const productQty = parseInt(product.getElementsByClassName('listProductQty')[0].value);

  if(productName == '' || isNaN(parseInt(productQty)))
  {
    console.log('maybe...');
    return;
  }

  if(productQty < 1)
  {
      deleteProduct(this);
      return;
  }
  const updatedProduct = {
    productId : productId,
    productName: productName,
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

  if(productNameInput.value == '' || isNaN(parseInt(productQtyInput.value)))
  {
    console.log('maybe...');
    return;
  }

  const newProduct = {
    productName: productNameInput.value,
    qty : productQtyInput.value
  }

  console.log(newProduct);
  
  fetch(url, {
    method: 'post',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  })
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
    product.value = data.productId;
    productNameInput.removeEventListener('change', createProduct);
    productQtyInput.removeEventListener('change', createProduct);
    productNameInput.addEventListener('change', updateProduct);
    productQtyInput.addEventListener('change', updateProduct);
  })
  .catch(function(error) {
     console.log('oh no!:(');
     console.log(JSON.stringify(error));
  });
}

function getFridgeItems () {
  while (fridge.firstChild) {
    fridge.removeChild(fridge.lastChild);
  }

  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    console.log(data);
    let fridgeItems = data;
    return fridgeItems.map(function(item) {
      var li = document.createElement('li');
      var inputQty = document.createElement('input');
      var inputName = document.createElement('input');

      li.value= item.productId;
      inputName.value = item.productName;
      inputName.classList.add('listProductName');
      inputName.addEventListener('change', updateProduct);
      inputQty.type = 'number';
      inputQty.value = item.qty;
      inputQty.classList.add('listProductQty');
      inputQty.addEventListener('change', updateProduct);
      li.appendChild(inputName);
      li.appendChild(inputQty);
      fridge.appendChild(li);
    })
  })
  .catch(function(error) {
    console.log('oh no!:(');
    console.log(JSON.stringify(error));
  });  
}

function newProduct() {
  var li = document.createElement('li');
  var inputQty = document.createElement('input');
  var inputName = document.createElement('input');

  inputName.classList.add('listProductName');
  inputName.addEventListener('change', createProduct);
  inputQty.type = 'number';
  inputQty.classList.add('listProductQty');
  inputQty.addEventListener('change', createProduct);
  li.appendChild(inputName);
  li.appendChild(inputQty);
  fridge.appendChild(li);
}

function initializeFridge () {
  while (fridge != null && fridge.firstChild) {
    fridge.removeChild(fridge.lastChild);
  }

  while (asideSpace.firstChild) {
    asideSpace.removeChild(asideSpace.lastChild);
  }

  asideSpace.classList.remove("hideSpace");
  asideSpace.classList.add("fridgeSpace");

  fridge = document.createElement('ul');
  fridge.classList.add("groceryList");

  asideSpace.appendChild(fridge);
  var addNewProductBtn = document.createElement('button');
  addNewProductBtn.textContent = 'new Product';
  addNewProductBtn.addEventListener('click', newProduct);
  asideSpace.insertBefore(addNewProductBtn, fridge.nextSibling);
  fridgeBtn.removeEventListener('click', initializeFridge);
  fridgeBtn.addEventListener('click', hideFridge);
  getFridgeItems();
}

function hideFridge () {
  fridgeBtn.removeEventListener('click', hideFridge);
  fridgeBtn.addEventListener('click', initializeFridge);
  asideSpace.classList.remove("fridgeSpace");
  asideSpace.classList.add("hideSpace");
}