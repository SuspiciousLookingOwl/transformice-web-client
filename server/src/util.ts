const isObject = (d: unknown) => typeof d === "object" && d !== null;

/**
 * Flatten object to JSON like object with only necessary property
 *
 * Also can exclude props key from the object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flatten = (obj: any, ...props: any[]) => {
	if (!isObject(obj)) return obj;

	const objProps = Object.keys(obj)
		.filter((k) => !k.startsWith("_"))
		.map((k) => ({ [k]: true }));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const newProps: any[] = objProps.length
		? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
		  // @ts-ignore
		  Object.assign(...objProps, ...props)
		: Object.assign({}, ...props);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const out: any = {};

	// eslint-disable-next-line prefer-const
	for (let [prop, newProp] of Object.entries(newProps)) {
		if (!newProp) continue;
		newProp = newProp === true ? prop : newProp;

		const element = obj[prop];
		const elemIsObj = isObject(element);
		const valueOf = elemIsObj && typeof element.valueOf === "function" ? element.valueOf() : null;

		// If it's an array, flatten each element
		if (Array.isArray(element)) out[newProp] = element.map((e) => flatten(e, ...props));
		// If it's an object with a primitive `valueOf`, use that value
		else if (typeof valueOf !== "object") out[newProp] = valueOf;
		// If it's a primitive
		else if (!elemIsObj) out[newProp] = element;
		// Other
		else out[newProp] = flatten(element, ...props);
	}

	return out;
};
