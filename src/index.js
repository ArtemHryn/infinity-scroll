import Notiflix from 'notiflix';
import ImagesAPIService from './js/imagesAPIs';
import renderImages from './js/imagesRender';
import renderTotalHits from './js/renderTotalHits';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  imagesContainer: document.querySelector('.js-articles-container'),
  director: document.querySelector('#director'),
  spinner: document.querySelector('.spinner'),
};

const imagesAPIs = new ImagesAPIService();

let simpleGallery = new SimpleLightbox('.articles a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.form.addEventListener('submit', onSearch);

async function onSearch(e) {
  try {
    e.preventDefault();
    imagesAPIs.query = e.currentTarget.elements.searchQuery.value.trim();
    if (!imagesAPIs.query) {
      Notiflix.Notify.failure(`Oops, the search is empty`);
      return;
    }
    clearImagesContainer();
    imagesAPIs.resetPage();
    const images = await imagesAPIs.fetchImages();
    if (images.totalHits === 0) {
      Notiflix.Notify.failure(`Sorry, there is no ${imagesAPIs.query}`);
      return;
    }
    showTotalPictures(images.totalHits);
    uploadingImages(images);
    lazyLoad();
    refs.spinner.classList.remove('is-hidden');
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

function uploadingImages(images) {
  refs.imagesContainer.insertAdjacentHTML(
    'beforeend',
    renderImages(images.hits)
  );
  simpleGallery.refresh();
}

function smoothyScroll() {
  const { height: cardHeight } = document
    .querySelector('.js-articles-container')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function showTotalPictures(totalImages) {
  refs.imagesContainer.previousSibling.innerHTML = '';
  refs.imagesContainer.insertAdjacentHTML(
    'beforebegin',
    renderTotalHits(totalImages)
  );
  Notiflix.Notify.success(`Hooray! We found ${totalImages} images.`);
}

function lazyLoad() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(image => {
    image.addEventListener('load', onImageLoaded, { once: true });
  });
}

function onImageLoaded(e) {
  e.target.classList.add('appear');
}

const onLoadMoreImages = async entries => {
  entries.forEach(async entry => {
    if (imagesAPIs.images > imagesAPIs.totalHits) {
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
      );
      refs.spinner.classList.add('is-hidden');
      return;
    }
    if (
      entry.isIntersecting &&
      imagesAPIs.images < imagesAPIs.totalHits &&
      imagesAPIs.query !== ''
    ) {
      const images = await imagesAPIs.fetchImages();
      uploadingImages(images);
      smoothyScroll();
      lazyLoad();
    }
  });
};

const observer = new IntersectionObserver(onLoadMoreImages, {
  rootMargin: '200px',
});
observer.observe(refs.director);
