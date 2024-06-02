// http://twitter.com/share?url=https://naomi-osaka.studio.design&text=Congratulations, Naomi Osaka!&hashtags=withSTUDIO

export const TwitterShareLink = (url: string, text: string, hashtags: string[]) => {
  const tags = [`url=${url}`, `text=${text}`, hashtags.map((val) => `hashtags=${val}`).join("&")];
  return `http://twitter.com/share?${tags.join("&")}`;
};
