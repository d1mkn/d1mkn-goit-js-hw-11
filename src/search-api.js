const API_KEY = '33877406-e4b4107cd4df69d9ba05d00a1';
const BASE_URL = 'https://pixabay.com/api';

import axios from 'axios';
export { fetchImages };

axios.defaults.baseURL = BASE_URL;

export default class ImgApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
  }

  async fetchImages(query) {
    const response = await axios.get(
      `?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=${this.perPage}`
    );
    const images = await response.data.hits;
    return images;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
