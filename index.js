let currentPage = 0
let lastSearchQuery = null;
const maxPageSize = 10

const productTable = document.getElementById("product-table-body")
const navigationBar = document.getElementById("table-navigation")
const prevPageButton = document.getElementById("prev-page-button")
const nextPageButton = document.getElementById("next-page-button")
const pageNumDiv = document.getElementById("page-num")
const searchBar = document.getElementById("search-bar")
const filterButton = document.getElementById("title-filter-button")
const clearSearchBarButton = document.getElementById("clear-search-bar-button")

async function fetchData(page){
    return await fetch(`https://dummyjson.com/products?` +
        `limit=${maxPageSize+1}` +
        `&skip=${maxPageSize*page}` +
        `&select=id,title,price`)
        .then(res => res.json())
}

async function searchData(page, searchQuery){
    return await fetch(`https://dummyjson.com/products/search?` +
        `limit=${maxPageSize+1}` +
        `&skip=${maxPageSize*page}` +
        `&q=${searchQuery}` +
        `&select=id,title,price`)
        .then(res => res.json())
}

function getPageHTML(pageNum){
    if(pageNum < 0)
        return undefined
    if(pageNum === 0){
        prevPageButton.style.visibility = "hidden"
    } else {
        prevPageButton.style.visibility = "visible"
    }
    let data = null
    if(lastSearchQuery === null){
        data = fetchData(pageNum).then(data => data.products)
    } else {
        data = searchData(pageNum, lastSearchQuery).then(data => data.products)
    }
    return data.then(products => {
            console.log(products)
            let newProductTableHTML= ""
            for (let i = 0; i < Math.min(maxPageSize, products.length); ++i) {
                newProductTableHTML += `
                            <tr class="product-data">
                                <td>${products[i].id}</td>
                                <td>${products[i].title}</td>
                                <td>${products[i].price}</td>
                            </tr>`
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
    pageNumDiv.innerHTML = `${currentPage+1}`
    getPageHTML(currentPage).then(res => productTable.innerHTML = res)
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

