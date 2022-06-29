import { imageRegistry } from "../services/registry.service.js";

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
        url: unsplashImage.urls.small,
        author: unsplashImage.user.name,
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
  imageRegistry.set(game_id, imagesSet);

  return imagesSet;

}
