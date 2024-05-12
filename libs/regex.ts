// https://regexr.com/39nr7
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/replace

export const urlRegexp =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export const urlLinkTagReplacement = (
  text: string,
  tag: {
    start: string;
    end: string;
  } = {
    start: '<a class="link link-info" href="$&" target="__blank">',
    end: "</a>",
  },
) => text.replace(urlRegexp, `${tag.start}$&${tag.end}`);

export const isJsonString = (target: string) => {
  try {
    JSON.parse(target);
    return true;
  } catch {
    return false;
  }
};
export const isUrl = (target: string) => {
  try {
    new URL(target);
    return true;
  } catch {
    return false;
  }
};
export const isImage = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp|JPG)/;
