// 取得 API 網址
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/' 
const POSTER_URL = BASE_URL + '/posters/'

/* 測試用 axios 呼叫 API
axios.get(INDEX_URL).then((response) => {
  console.log(response)
  console.log(response.data)
  // Array(80)
  console.log(response.data.results)
})
*/

const movies = []
let filteredMovies = []

const MOVIES_PER_PAGE = 12
let displayMode = 'card-mode' // 初始顯示卡片模式
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

// 展示電影清單,演算需要的 template literal，暫存在 rawHTML 這個變數中
function renderMovieList(data) {
  if(displayMode === 'card-mode') {
    let rawHTML = ' '
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Posters">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <!-- footer放入 "more" 跟 "+" 按鈕 -->
            <div class="card-footer text-muted">
              <!-- Button trigger modal -->
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
                <i class="fa-regular fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    })
    // 使用 innerHTML 將演算好的 rawHTML 放進 #data-panel
    dataPanel.innerHTML = rawHTML
  } else if (displayMode === "list-mode") {
    let rawHTML = '<ul class="list-group">'
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <h5>${item.title}</h5>
        <!-- footer放入 "more" 跟 "+" 按鈕 -->
        <div>
          <!-- Button trigger modal -->
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
      </li>
      `
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
}

// 渲染分頁器
function renderPaginator(amount) {
  // 計算總頁數 80 / 12 = 6...8 => 7 頁
  // Math.ceil() 無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for(let page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML 
}


// 切割每頁顯示資料
function getMoviesByPage(page) {
  // 應該怎麼分頁 movies ? filteredMovies ?
  // 如果 filteredMovies 有東西,就給 filteredMovies ,如果是空陣列,給 movies
  const data = filteredMovies.length ? filteredMovies : movies
  // 切割的起點
  const startIndex =  (page - 1) * MOVIES_PER_PAGE
  // slice(起點,終點):切割陣列的一部份,回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


// 電影的詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date') 
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    // 資料存在 response.data.results
    const data = response.data.results
    // console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText =  data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"></img>`
  })
}

// 加入收藏清單
// 把收藏的電影id找出來丟到 Local Storage,Local Storage存放字串
function addToFavorite(id) {
  // list 以JSON的格式存放收藏清單
  // getItem 如果沒有東西就給空陣列[],JSON.parse() 把字串變成 Javascript 的 object 或陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // find()把movies每一部電影都丟到 isMovieIdMatched 函式去檢查,回傳所有跟該電影有關的資料
  const movie = movies.find(movie => movie.id === id)

  // 判斷是否清單中已有相同的電影,如果有就立刻結束,不會執行後續的程式碼(放入收藏清單)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  // 如果沒有相同電影,把電影放到清單list中
  list.push(movie)
  // console.log(list)
  // JSON.stringify() 把 Javascript 資料轉成 JSON字串,放到 localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// 綁定點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event){
  //判斷點擊事件是否為 More button
  if (event.target.matches('.btn-show-movie')){
    // dataset上所有 data 會變成 object 呈現,且值都會是"字串"
    // console.log(event.target.dataset) 
    // id轉成數字
    showMovieModal(Number(event.target.dataset.id))
  // 點擊收藏按鈕"+"
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
/* 匿名函式寫法, debug 會不知道哪裡出錯 
dataPanel.addEventListener('click', (event) => {
  console.error('Error')
})
*/


// 在搜尋框綁定表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 取消預設事件,避免重新整理
  event.preventDefault()
  // console.log(event)

  // console.log(searchInput.value)
  // toLowerCase()字串轉小寫,希望關鍵字是不論大小寫都可以被搜尋到
  const keyword = searchInput.value.trim().toLowerCase()
  // 存放符合篩選條件的項目
  
  // 錯誤處理：輸入無效字串
  // if(!keyword.length){
  //   return alert('請輸入有效字串！')
  // }

  // 條件篩選
  // 【作法一】用迴圈迭代：for-of
  // for (const movie of movies){
  //   // movie 的 title 包含 keyword
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     // 放到 filteredMovies[] 裡
  //     filteredMovies.push(movie) 
  //   }
  // } 
  
  // 【作法二】用條件來迭代：filter
  filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(keyword)
  )

  if(filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  // 根據篩選結果的筆數重新渲染分頁器
  renderPaginator(filteredMovies.length)
  // 根據篩選結果重新渲染電影清單,顯示第一頁搜尋結果
  renderMovieList(getMoviesByPage(1))
})


// 在分頁器綁上監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // tagName==='A'就是 <a></a>,如果點擊的不是直接結束
  if (event.target.tagName !== 'A') return
  // 透過 dataset 顯示點擊到的頁數
  // console.log(event.target.dataset.page)
  currentPage = Number(event.target.dataset.page)
  // 根據點擊到的頁數顯示畫面
  renderMovieList(getMoviesByPage(currentPage))
})


// 在切換模式按鈕上綁監聽器
changeMode.addEventListener('click', function onChangeButtonClicked(event) {
  if (event.target.matches('#card-button')){
    displayMode = 'card-mode'
    renderMovieList(getMoviesByPage(currentPage)) // 點擊完要渲染畫面才會變動
  } else if (event.target.matches('#list-button')) { 
    displayMode = 'list-mode'
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 取得 API 資料
axios.get(INDEX_URL)
  .then((response) => {
    /* 直接使用 push 會變成只有一個元素的陣列
    movies.push(response.data.results)
    console.log(movies)
    */

    /* 解法1: 使用for-of
    for (const movie of response.data.results){
      movies.push(movie)
    }
    console.log(movies)
    */

    // 解法2: 使用展開運算子,把每一筆資料放到 movies 陣列
    movies.push(...response.data.results)

    // 不能丟整個movies進去,必須透過 getMoviesByPage() 處理
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))


