export const ciEquals = (a: string, b: string) => {
	return typeof a === "string" && typeof b === "string"
		? a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0
		: a === b;
};

export const capitalize = (s: string) => {
	if (typeof s !== "string") return "";
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const getCommunity = (name: string) => {
	const community: { [key: string]: string } = {
		af: "za",
		am: "et",
		ar: "iar",
		be: "by",
		bi: "vu",
		bn: "bd",
		bs: "ba",
		ca: "ad",
		cs: "cz",
		da: "dk",
		dv: "mv",
		dz: "bt",
		el: "gr",
		en: "gb",
		et: "ee",
		fa: "ir",
		ga: "ie",
		he: "il",
		hi: "in",
		hy: "am",
		ja: "jp",
		ka: "ge",
		kk: "kz",
		kl: "gl",
		km: "kh",
		ko: "kr",
		ky: "kg",
		lb: "lu",
		lo: "la",
		mo: "md",
		ms: "my",
		my: "mm",
		na: "nr",
		ne: "np",
		ny: "mw",
		qu: "bo",
		rn: "bi",
		sl: "si",
		sm: "ws",
		sq: "al",
		sr: "rs",
		ss: "sz",
		st: "ls",
		su: "id",
		sv: "se",
		sw: "ke",
		ta: "lk",
		tg: "tj",
		ti: "er",
		tk: "tm",
		tl: "ph",
		tn: "bw",
		uk: "ua",
		ur: "pk",
		vi: "vn",
		wo: "sn",
		yo: "ng",
		zh: "hk"
	};

	return community[name] || "INT";
};

export const getAvatarById = (id: number) => {
	const lastId = id % 10000;
	return `https://avatars.atelier801.com/${lastId}/${id}${
		id !== 0 ? "_50" : ""
	}.jpg`;
};
