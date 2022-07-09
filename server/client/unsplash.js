import { imageRegistry } from "../services/registry.service.js";
import { getPictureById } from "../db/picture.js";
import { ERROR, PictioError } from "../ws/error.js";

const UNSPLASH_HEADERS = new Headers({
  "Accept-Version": "v1",
  "Authorization": `Client-ID ${process.env.UNSPLASHAK}`,
});
const UNSPLASH_LOCATION = "https://api.unsplash.com";
const UNSPLASH_MAX_COUNT = 30;

export async function getRandomImages(game_id, nbImages) {
  let images = imageRegistry.get(game_id);
  if (images == null) {
    images = [];
    imageRegistry.set(game_id, images);
  }
  if (images.length < nbImages) {
    let response;
    try {
      response = await fetch(`${UNSPLASH_LOCATION}/photos/random?count=${UNSPLASH_MAX_COUNT}`, {
        method: "GET",
        headers: UNSPLASH_HEADERS,
      })
      const unsplashImages = await response.json();
      const newImages = unsplashImages.map(unsplashImage => ({
        external_id: unsplashImage.id,
        url_small: unsplashImage.urls.small,
        url_medium: unsplashImage.urls.regular,
        url_big: unsplashImage.urls.full,
        url_origin: unsplashImage.urls.raw,
        author: unsplashImage.user.name,
        author_url: unsplashImage.user.links.html,
        download_url: unsplashImage.links.download,
        download_event_url: unsplashImage.links.download_location,
        description: unsplashImage.description ?? "undescribed",
      }));
      images = [...images, ...newImages];
    } catch (e) {
      console.error(e)
      console.error(`ERROR FETCH UNSPLASH - ${response?.status} ${response?.statusText}`)
      return [];
    }
  }

  const imagesSet = images.splice(0, nbImages);
  imageRegistry.set(game_id, images);

  return imagesSet;

}

export async function sendDownloadEvent(picture_id) {
  // On récupère l'image
  const picture = getPictureById(picture_id);
  if (picture == null) return new PictioError(ERROR.NOT_FOUND);
  try {
    const response = await fetch(picture.download_event_url, {
      method: "GET",
      headers: UNSPLASH_HEADERS,
    });
  } catch (e) {
    console.error(e)
    console.error(`ERROR FETCH UNSPLASH - ${response?.status} ${response?.statusText}`)
  }
}
