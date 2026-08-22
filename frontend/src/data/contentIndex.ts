/**
 * Только СЛАГИ городов и стран, у которых есть свой текст.
 *
 * Зачем отдельный модуль. HomeSeoSection нужен один вопрос: «есть ли у этого
 * города своя страница». Он импортировал для этого CITY_CONTENT целиком —
 * а это 180 КБ прозы про районы и рынки, которые главной не нужны ни одним
 * словом. Объект-литерал нельзя вытрясти тришейкингом, поэтому все 220 КБ
 * уезжали в бандл каждому посетителю главной.
 *
 * Файл генерируется из cityContent.ts и countryContent.ts; расхождение
 * ловится проверкой в vite.config.ts на сборке.
 */
export const CITY_CONTENT_SLUGS: ReadonlySet<string> = new Set(["almaty", "astana", "baku", "bishkek", "bobruysk", "brest", "chelyabinsk", "dushanbe", "ekaterinburg", "fergana", "gomel", "grodno", "harkov", "karaganda", "kazan", "kiev", "kishinyov", "krasnodar", "krasnoyarsk", "minsk", "mogilev", "moskva", "nizhniy-novgorod", "novosibirsk", "odessa", "omsk", "pavlodar", "perm", "rostov-na-donu", "samara", "samarkand", "sankt-peterburg", "saratov", "shymkent", "sochi", "tashkent", "tbilisi", "tyumen", "ufa", "ust-kamenogorsk", "vitebsk", "volgograd", "voronezh", "yerevan"]);

export const COUNTRY_CONTENT_SLUGS: ReadonlySet<string> = new Set(["armeniya", "azerbaydzhan", "belarus", "gruziya", "kazakhstan", "kyrgyzstan", "moldova", "tadzhikistan", "ukraina", "uzbekistan"]);
