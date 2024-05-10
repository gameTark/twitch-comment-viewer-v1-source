import d from "dayjs";

import "dayjs/locale/ja";

import isToday from "dayjs/plugin/isToday";
import relativeTime from "dayjs/plugin/relativeTime";

d.extend(isToday);
d.extend(relativeTime);
d.locale("ja");

export const dayjs = d;
