// 取得 API 網址
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 從 localStorage 抓取收藏清單
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


// 展示電影清單,演算需要的 template literal，暫存在 rawHTML 這個變數中
function renderMovieList(data) {
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
            <!-- footer放入 "more" 跟 "X" 按鈕 -->
            <div class="card-footer text-muted">
              <!-- Button trigger modal -->
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  // 使用 innerHTML 將演算好的 rawHTML 放進 #data-panel
  dataPanel.innerHTML = rawHTML
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
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"></img>`
  })
}


// 移除已收藏電影
function removeFromFavorite(id) {
  // 收藏清單是空的,結束函式
  if (!movies || !movies.length) return
  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex(movie => movie.id === id)
  // 傳入的 id 在收藏清單中不存在
  if (movieIndex === -1) return
  // 從 movieIndex 開始刪除1個
  movies.splice(movieIndex,1)
  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //更新頁面
  renderMovieList(movies)
}

// 綁定點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  //判斷點擊事件是否為 More button
  if (event.target.matches('.btn-show-movie')) {
    // dataset上所有 data 會變成 object 呈現,且值都會是"字串"
    // console.log(event.target.dataset) 
    // id轉成數字
    showMovieModal(Number(event.target.dataset.id))
    // 點擊收藏按鈕"+"
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)