const UNSPLASH_HEADERS = new Headers({
  "Accept-Version": "v1",
  "Authorization": `Client-ID ${process.env.UNSPLASHAK}`,
});
const UNSPLASH_LOCATION = "https://api.unsplash.com";

export async function getRandomImages(nbImages) {
  let response;
  try {
    response = await fetch(`${UNSPLASH_LOCATION}/photos/random?count=${nbImages}`, {
      method: "GET",
      headers: UNSPLASH_HEADERS,

    })
    const unsplashImages = await response.json();
    return unsplashImages.map(unsplashImage => ({
      url: unsplashImage.urls.small,
      author: unsplashImage.user.name,
      description: unsplashImage.description ?? "undescribed",
    }));
  } catch (e) {
    console.error(e)
    console.error(`ERROR FETCH UNSPLASH - ${response?.status} ${response?.statusText}`)
    return [];
  }
}
