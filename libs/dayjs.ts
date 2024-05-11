import d from "dayjs";

import "dayjs/locale/ja";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
import relativeTime from "dayjs/plugin/relativeTime";

d.extend(isToday);
d.extend(relativeTime);
d.extend(isSameOrBefore);
d.locale("ja");

export const dayjs = d;
