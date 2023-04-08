import ImgApiService from './search-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallerySection: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
const imgApiService = new ImgApiService();
let simpleLightBox;

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onClick);

async function onSubmit(e) {
  e.preventDefault();

  try {
    clearGallery();
    imgApiService.resetPage();
    imgApiService.query = e.currentTarget.searchQuery.value;

    const response = await imgApiService.fetchImages(imgApiService.query);
    const images = await response.data.hits;
    refs.loadMoreBtn.classList.remove('is-hidden');

    if (images.length === 0) {
      hideMoreBtn();
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    imgApiService.incrementPage();
    await renderUI(images);
    refreshSimpleLightBox();
  } catch (error) {
    hideMoreBtn();
    console.log(error);
  }
}

async function onClick() {
  simpleLightBox.destroy();
  try {
    const response = await imgApiService.fetchImages(imgApiService.query);
    const images = await response.data.hits;

    if (response.data.hits.length === 0) {
      hideMoreBtn();
      notifyWarning();
    }

    await renderUI(images);
    refreshSimpleLightBox();
    imgApiService.incrementPage();
    smoothScroll();
  } catch (error) {
    console.log(error);
    hideMoreBtn();
    notifyWarning();
  }
}

async function renderUI(images) {
  return await images.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) =>
      refs.gallerySection.insertAdjacentHTML(
        'beforeend',
        `<a class="gallery__item" href="${largeImageURL}">
        <div class="photo-card">
        <div class="photo-wrap">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </div>
        <div class="info">
        <p class="info-item"><b><span>${likes}</span> Likes</b></p>
        <p class="info-item"><b><span>${views}</span> Views</b></p>
        <p class="info-item"><b><span>${comments}</span> Comments</b></p>
        <p class="info-item"><b><span>${downloads}</span> Downloads</b></p>
        </div>
        </div></a>`
      )
  );
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function hideMoreBtn() {
  refs.loadMoreBtn.classList.add('is-hidden');
}

function refreshSimpleLightBox() {
  simpleLightBox = new SimpleLightbox('.gallery a').refresh();
}

function notifyWarning() {
  Notify.warning("We're sorry, but you've reached the end of search results.");
}

function clearGallery() {
  refs.gallerySection.innerHTML = '';
}
