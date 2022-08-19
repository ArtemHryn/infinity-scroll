import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '29161019-6ea1164b9701eafe63306bc8a';

export default class ImagesAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.totalImages = 0;
    this.totalHits = null;
  }

  async fetchImages() {
    try {
      const options = {
        params: {
          key: API_KEY,
          q: this.searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: this.page,
          per_page: 40,
        },
      };
      this.totalImages += options.params.per_page;
      const url = `${BASE_URL}`;
      const response = await axios.get(url, options);
      this.totalHits = response.data.totalHits;
      this.incrementPage();
      return await response.data;
    } catch (error) {
      throw new Error(`Oops, something went wrong`)
    }
  }

  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
  get images() {
    return this.totalImages;
  }
}
