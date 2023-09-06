const productTable = document.getElementById("product-table-body")
const navigationBar = document.getElementById("table-navigation")
const prevPageButton = document.getElementById("prev-page-button")
const nextPageButton = document.getElementById("next-page-button")
const pageNumDiv = document.getElementById("page-num")
const searchBar = document.getElementById("search-bar")
const filterButton = document.getElementById("title-filter-button")
const clearSearchBarButton = document.getElementById("clear-search-bar-button")

let currentPage = 0
let lastSearchQuery = null;
const maxPageSize = 10
let fetchedData = []

/**
 * Close all opened dropdowns if clicked not on dropdown button.
 * @param event mouse event
 */
window.onclick = function (event){
    if(!event.target.matches(".dropdown-button")){
        let dropdowns = document.getElementsByClassName("dropdown-list")
        for(let i = 0; i < dropdowns.length; ++i){
            dropdowns[i].setAttribute("hidden", "hidden")
        }
    }
}

/**
 * Fetch data from api.
 * Only fetches products that are currently shown on table.
 * @param {number} page page that is currently shown.
 * @returns {Promise<any>} all fetched data.
 */
async function fetchData(page){
    return fetchedData = await fetch(`https://dummyjson.com/products?` +
        `limit=${maxPageSize+1}` +
        `&skip=${maxPageSize*page}` +
        `&select=id,title,price,description`)
        .then(res => res.json())
        .then(res => res.products)
        .catch(TypeError => {
            showFailedToConnectToast()
            return []
        })
}

/**
 * Search data in api.
 * Similar to fetchData(page), but only fetches data that have search query in title or description
 * @param {number} page page that is currently shown.
 * @param {string} searchQuery shows what data should be fetched.
 * @returns {Promise<any>} all fetched data.
 */
async function searchData(page, searchQuery){
    return fetchedData = await fetch(`https://dummyjson.com/products/search?` +
        `limit=${maxPageSize+1}` +
        `&skip=${maxPageSize*page}` +
        `&q=${searchQuery}` +
        `&select=id,title,price,description`)
        .then(res => res.json())
        .then(res => res.products)
        .catch(TypeError => {
            showFailedToConnectToast()
            return []
        })
}

/**
 * "Delete" a product and shows toast that product was deleted.
 * @param button a button that called this function
 */
async function deleteProduct(button){
    let deletedProduct = await fetch(
        `https://dummyjson.com/products/${button.getAttribute("product-id")}?select=id,title`,
        {method: "DELETE",})
        .then(res => res.json())

    let toast = document.getElementById("deleted-product-toast")
        toast.innerHTML = `Product "${deletedProduct.title}" with id = ${deletedProduct.id} was deleted`
    toast.style.visibility = "visible"
    setTimeout(function () {
        toast.style.visibility = "hidden"
    }, 5000)
}

function showDropdown(button){
    let dropdown = document.getElementById(`dropdown-${button.id}`)
    let hidden = dropdown.getAttribute("hidden");
    if(hidden){
        dropdown.removeAttribute("hidden")
    } else{
        dropdown.setAttribute("hidden", "hidden")
    }
}

function createTableRow(id, title, price, index){
    return `<tr class="product-data">
        <td>${id}</td>
        <td>${title}</td>
        <td>${price}</td>
        <td><div class="dropdown">
            <button id="product-${index}" onclick="showDropdown(this)" class="dropdown-button">More</button>
            <ul id="dropdown-product-${index}" hidden class="dropdown-list">
                <li>${fetchedData[index].description}</li>
                <li>
                    <button class="delete-product-button" id="delete-product-${index}" product-id="${id}" 
                    onclick="deleteProduct(this)">
                        Delete
                    </button>
                </li>
            </ul>
        </div></td>
    </tr>`
}

/**
 * Create new page and return it's html code
 * @param {number} pageNum page number
 * @returns {Promise<string>|undefined} full html code of the table.
 */
function getTableHTML(pageNum){
    if(pageNum < 0)
        return undefined
    if(pageNum === 0){
        prevPageButton.style.visibility = "hidden"
    } else {
        prevPageButton.style.visibility = "visible"
    }
    let data = null
    if(lastSearchQuery === null){
        data = fetchData(pageNum)
    } else {
        data = searchData(pageNum, lastSearchQuery)
    }
    return data.then(products => {
            console.log(products)
            let newProductTableHTML= ""
            for (let i = 0; i < Math.min(maxPageSize, products.length); ++i) {
                newProductTableHTML += createTableRow(products[i].id, products[i].title, products[i].price, i)
            }
            if (products.length < maxPageSize + 1) {
                nextPageButton.style.visibility = "hidden"
            } else {

                nextPageButton.style.visibility = "visible"
            }
            return newProductTableHTML
        })
}

function loadPage(pageNum){
    pageNumDiv.innerHTML = `${pageNum+1}`
    getTableHTML(currentPage).then(res => productTable.innerHTML = res)
}

function showFailedToConnectToast(){
    let toast = document.getElementById("error-toast")
    toast.style.visibility = "visible"
    setTimeout(function () {
        toast.style.visibility = "hidden"
    }, 5000)
}

prevPageButton.onclick = function (){
    currentPage--;
    loadPage(currentPage)
}
nextPageButton.onclick = function (){
    currentPage++;
    loadPage(currentPage)
}
filterButton.onclick = function (){
    lastSearchQuery = searchBar.value
    currentPage = 0
    loadPage(currentPage)
}
clearSearchBarButton.onclick = function (){
    lastSearchQuery = null
    currentPage = 0
    searchBar.value = null
    loadPage(currentPage)
}

searchBar.value = ""
loadPage(currentPage)

