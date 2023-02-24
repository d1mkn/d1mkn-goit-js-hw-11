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

    const images = await imgApiService.fetchImages(imgApiService.query);
    refs.loadMoreBtn.classList.remove('is-hidden');

    if (images.length === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    imgApiService.incrementPage();
    await renderUI(images);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();
  } catch (error) {
    console.log(error);
  }
}

async function onClick() {
  simpleLightBox.destroy();
  try {
    const images = await imgApiService.fetchImages(imgApiService.query);
    await renderUI(images);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();
    imgApiService.incrementPage();
    smoothScroll();
  } catch (error) {
    console.log(error);
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
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
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
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

function clearGallery() {
  refs.gallerySection.innerHTML = '';
}
