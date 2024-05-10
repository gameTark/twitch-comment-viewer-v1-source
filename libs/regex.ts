// https://regexr.com/39nr7
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/replace

export const urlValidation =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
export const urlValidationOnly =
  /[^(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*$)/;
// 'testほげほげhttps://google.co.jpあいうえお'.replace(urlValidation, "<a>$&</a>")

export const urlLinkTagReplacement = (
  text: string,
  tag: {
    start: string;
    end: string;
  } = {
    start: '<a class="link link-info" href="$&" target="__blank">',
    end: "</a>",
  },
) => text.replace(urlValidation, `${tag.start}$&${tag.end}`);


export const isJsonString = (target: string) => {
  try {
    JSON.parse(target)
    return true;
  } catch {
    return false;
  }
};