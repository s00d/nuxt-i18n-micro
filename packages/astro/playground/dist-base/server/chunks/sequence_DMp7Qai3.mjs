import { $ as GetStaticPathsInvalidRouteParam, C as isRoute404, D as DEFAULT_404_COMPONENT, I as decryptString, N as originPathnameSymbol, Q as GetStaticPathsExpectedParams, R as AstroError, Z as ForbiddenRewrite, _t as NoMatchingStaticPathFound, at as InvalidGetStaticPathsReturn, bt as PrerenderDynamicEndpointPathCollide, et as GetStaticPathsRequired, i as renderComponent, it as InvalidGetStaticPathsEntry, j as fetchStateSymbol, o as createSlotValueFromString, u as renderTemplate, v as isAstroComponentFactory, vt as PageNumberParamNotFound, w as isRoute500, wt as RewriteWithBodyUsed, y as markHTMLString } from "./server_Dx_4z2w4.mjs";
import colors from "piccolore";
import { escape } from "html-escaper";
//#region ../../../node_modules/.pnpm/@astrojs+internal-helpers@0.11.0/node_modules/@astrojs/internal-helpers/dist/path.js
function appendForwardSlash(path) {
	return path.endsWith("/") ? path : path + "/";
}
function prependForwardSlash(path) {
	return path[0] === "/" ? path : "/" + path;
}
var MANY_LEADING_SLASHES = /^\/{2,}/;
function collapseDuplicateLeadingSlashes(path) {
	if (!path) return path;
	return path.replace(MANY_LEADING_SLASHES, "/");
}
var MANY_SLASHES = /\/{2,}/g;
function collapseDuplicateSlashes(path) {
	if (!path) return path;
	return path.replace(MANY_SLASHES, "/");
}
var MANY_TRAILING_SLASHES = /\/{2,}$/g;
function collapseDuplicateTrailingSlashes(path, trailingSlash) {
	if (!path) return path;
	return path.replace(MANY_TRAILING_SLASHES, trailingSlash ? "/" : "") || "/";
}
function removeTrailingForwardSlash(path) {
	return path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}
function removeLeadingForwardSlash(path) {
	return path.startsWith("/") ? path.substring(1) : path;
}
function trimSlashes(path) {
	return path.replace(/^\/|\/$/g, "");
}
function isString(path) {
	return typeof path === "string" || path instanceof String;
}
var INTERNAL_PREFIXES = /* @__PURE__ */ new Set([
	"/_",
	"/@",
	"/.",
	"//"
]);
var JUST_SLASHES = /^\/{2,}$/;
function isInternalPath(path) {
	const prefix = path.slice(0, 2).replace(/\\/g, "/");
	return INTERNAL_PREFIXES.has(prefix) && !JUST_SLASHES.test(path);
}
function joinPaths(...paths) {
	return paths.filter(isString).map((path, i) => {
		if (i === 0) return removeTrailingForwardSlash(path);
		else if (i === paths.length - 1) return removeLeadingForwardSlash(path);
		else return trimSlashes(path);
	}).join("/");
}
function removeQueryString(path) {
	const index = path.lastIndexOf("?");
	return index > 0 ? path.substring(0, index) : path;
}
function isRemotePath(src) {
	if (!src) return false;
	const trimmed = src.trim();
	if (!trimmed) return false;
	let decoded = trimmed;
	let previousDecoded = "";
	let maxIterations = 10;
	while (decoded !== previousDecoded && maxIterations > 0) {
		previousDecoded = decoded;
		try {
			decoded = decodeURIComponent(decoded);
		} catch {
			break;
		}
		maxIterations--;
	}
	if (/^[a-zA-Z]:/.test(decoded)) return false;
	if (decoded[0] === "/" && /^\/[\w.@-]/.test(decoded)) return false;
	if (decoded[0] === "\\") return true;
	if (decoded.startsWith("//")) return true;
	try {
		const url = new URL(decoded, "http://n");
		if (url.username || url.password) return true;
		if (decoded.includes("@") && !url.pathname.includes("@") && !url.search.includes("@")) return true;
		if (url.origin !== "http://n") {
			if (url.protocol.toLowerCase() === "file:") return false;
			return true;
		}
		if (URL.canParse(decoded)) return true;
		return false;
	} catch {
		return true;
	}
}
function isParentDirectory(parentPath, childPath) {
	if (!parentPath || !childPath) return false;
	if (parentPath.includes("://") || childPath.includes("://")) return false;
	if (isRemotePath(parentPath) || isRemotePath(childPath)) return false;
	if (parentPath.includes("..") || childPath.includes("..")) return false;
	if (parentPath.includes("\0") || childPath.includes("\0")) return false;
	const normalizedParent = appendForwardSlash(slash(parentPath).toLowerCase());
	const normalizedChild = slash(childPath).toLowerCase();
	if (normalizedParent === normalizedChild || normalizedParent === normalizedChild + "/") return false;
	return normalizedChild.startsWith(normalizedParent);
}
function slash(path) {
	return path.replace(/\\/g, "/");
}
function fileExtension(path) {
	const ext = path.split(".").pop();
	return ext !== path ? `.${ext}` : "";
}
function stripRequestBase(pathname, base) {
	pathname = collapseDuplicateLeadingSlashes(pathname);
	const baseWithoutTrailingSlash = removeTrailingForwardSlash(base);
	if (pathname === baseWithoutTrailingSlash) return "/";
	if (pathname.startsWith(baseWithoutTrailingSlash + "/")) return pathname.slice(baseWithoutTrailingSlash.length);
	return pathname;
}
var WITH_FILE_EXT = /\/[^/]+\.\w+$/;
function hasFileExtension(path) {
	return WITH_FILE_EXT.test(path);
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/middleware/defineMiddleware.js
function defineMiddleware(fn) {
	return fn;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/build/util.js
function shouldAppendForwardSlash(trailingSlash, buildFormat) {
	switch (trailingSlash) {
		case "always": return true;
		case "never": return false;
		case "ignore": switch (buildFormat) {
			case "directory": return true;
			case "preserve":
			case "file": return false;
		}
	}
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/i18n/path.js
function pathHasLocale(path, locales) {
	const segments = path.split("/").map(normalizeThePath);
	for (const segment of segments) for (const locale of locales) if (typeof locale === "string") {
		if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) return true;
	} else if (segment === locale.path) return true;
	return false;
}
function normalizeTheLocale(locale) {
	return locale.replaceAll("_", "-").toLowerCase();
}
function normalizeThePath(path) {
	return path.endsWith(".html") ? path.slice(0, -5) : path;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/i18n/error-routes.js
function isLocalizedErrorRoute(route, status, locales) {
	if (!locales) return false;
	const suffix = `/${status}`;
	if (!route.endsWith(suffix)) return false;
	const localeSegment = route.slice(0, -suffix.length);
	if (!localeSegment || localeSegment.includes("/", 1)) return false;
	return pathHasLocale(localeSegment, locales);
}
function getErrorRoutePath(pathname, status, routes, locales, appendTrailingSlash = false) {
	const suffix = appendTrailingSlash ? "/" : "";
	if (locales) {
		const firstSegment = pathname.split("/").find(Boolean);
		if (firstSegment && pathHasLocale(`/${firstSegment}`, locales)) {
			const localized = `/${firstSegment}/${status}`;
			if (routes.some((route) => route.route === localized)) return `${localized}${suffix}`;
		}
	}
	return `/${status}${suffix}`;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/helpers.js
function routeIsRedirect(route) {
	return route?.type === "redirect";
}
function routeIsFallback(route) {
	return route?.type === "fallback";
}
function getFallbackRoute(route, routeList) {
	const fallbackRoute = routeList.find((r) => {
		if (route.route === "/" && r.routeData.route === "/") return true;
		return r.routeData.fallbackRoutes.find((f) => {
			return f.route === route.route;
		});
	});
	if (!fallbackRoute) throw new Error(`No fallback route found for route ${route.route}`);
	return fallbackRoute.routeData;
}
function getCustom404Route(manifestData) {
	return manifestData.routes.find((r) => isRoute404(r.route));
}
function getCustom500Route(manifestData) {
	return manifestData.routes.find((r) => isRoute500(r.route));
}
function getDefaultStatusCode(manifest, routeData, pathname) {
	if (!routeData.pattern.test(pathname)) {
		for (const fallbackRoute of routeData.fallbackRoutes) if (fallbackRoute.pattern.test(pathname)) return 302;
	}
	const route = removeTrailingForwardSlash(routeData.route);
	const locales = manifest.i18n?.locales;
	if (isRoute404(route) || isLocalizedErrorRoute(route, 404, locales)) return 404;
	if (isRoute500(route) || isLocalizedErrorRoute(route, 500, locales)) return 500;
	return 200;
}
function routeHasHtmlExtension(route) {
	return route.segments.some((segment) => segment.some((part) => !part.dynamic && part.content.includes(".html")));
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/redirects/component.js
var RedirectComponentInstance = { default() {
	return new Response(null, { status: 301 });
} };
var RedirectSinglePageBuiltModule = {
	page: () => Promise.resolve(RedirectComponentInstance),
	onRequest: (_, next) => next()
};
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/assets/utils/getAssetsPrefix.js
function getAssetsPrefix(fileExtension, assetsPrefix) {
	let prefix = "";
	if (!assetsPrefix) prefix = "";
	else if (typeof assetsPrefix === "string") prefix = assetsPrefix;
	else prefix = assetsPrefix[fileExtension.slice(1)] || assetsPrefix.fallback;
	return prefix;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/render/ssr-element.js
var URL_PARSE_BASE = "https://astro.build";
function splitAssetPath(path) {
	const parsed = new URL(path, URL_PARSE_BASE);
	return {
		pathname: !URL.canParse(path) && !path.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname,
		suffix: `${parsed.search}${parsed.hash}`
	};
}
function appendQueryParams(path, queryParams) {
	const queryString = queryParams.toString();
	if (!queryString) return path;
	const hashIndex = path.indexOf("#");
	const basePath = hashIndex === -1 ? path : path.slice(0, hashIndex);
	const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
	return `${basePath}${basePath.includes("?") ? "&" : "?"}${queryString}${hash}`;
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
	const { pathname, suffix } = splitAssetPath(href);
	let url = "";
	if (assetsPrefix) url = joinPaths(getAssetsPrefix(fileExtension(pathname), assetsPrefix), slash(pathname)) + suffix;
	else if (base) url = prependForwardSlash(joinPaths(base, slash(pathname))) + suffix;
	else url = href;
	if (queryParams) url = appendQueryParams(url, queryParams);
	return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
	if (stylesheet.type === "inline") return {
		props: {},
		children: stylesheet.content
	};
	else return {
		props: {
			rel: "stylesheet",
			href: createAssetLink(stylesheet.src, base, assetsPrefix, queryParams)
		},
		children: ""
	};
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
	return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix, queryParams)));
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
	if (script.type === "external") return createModuleScriptElementWithSrc(script.value, base, assetsPrefix, queryParams);
	else return {
		props: { type: "module" },
		children: script.value
	};
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
	return {
		props: {
			type: "module",
			src: createAssetLink(src, base, assetsPrefix, queryParams)
		},
		children: ""
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/manifest/memo.js
function createManifestMemo(derive) {
	const cache = /* @__PURE__ */ new WeakMap();
	return {
		get(manifest) {
			if (cache.has(manifest)) return cache.get(manifest);
			const value = derive(manifest);
			cache.set(manifest, value);
			return value;
		},
		has(manifest) {
			return cache.has(manifest);
		},
		set(manifest, value) {
			cache.set(manifest, value);
		},
		invalidate(manifest) {
			cache.delete(manifest);
		}
	};
}
function createAsyncManifestMemo(derive) {
	const cache = /* @__PURE__ */ new WeakMap();
	return {
		get(manifest) {
			let promise = cache.get(manifest);
			if (!promise) {
				promise = derive(manifest);
				cache.set(manifest, promise);
				promise.catch(() => {
					if (cache.get(manifest) === promise) cache.delete(manifest);
				});
			}
			return promise;
		},
		invalidate(manifest) {
			cache.delete(manifest);
		}
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/request-body.js
async function readBodyWithLimit(request, limit) {
	const contentLengthHeader = request.headers.get("content-length");
	if (contentLengthHeader) {
		const contentLength = Number.parseInt(contentLengthHeader, 10);
		if (Number.isFinite(contentLength) && contentLength > limit) throw new BodySizeLimitError(limit);
	}
	if (!request.body) return /* @__PURE__ */ new Uint8Array();
	const reader = request.body.getReader();
	const chunks = [];
	let received = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) {
			received += value.byteLength;
			if (received > limit) throw new BodySizeLimitError(limit);
			chunks.push(value);
		}
	}
	const buffer = new Uint8Array(received);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return buffer;
}
var BodySizeLimitError = class extends Error {
	limit;
	constructor(limit) {
		super(`Request body exceeds the configured limit of ${limit} bytes`);
		this.name = "BodySizeLimitError";
		this.limit = limit;
	}
};
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/server-islands/endpoint.js
var SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
var SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
	return new Response(null, {
		status: 400,
		statusText: "Bad request: " + reason
	});
}
var DEFAULT_BODY_SIZE_LIMIT = 1048576;
async function getRequestData(request, bodySizeLimit = DEFAULT_BODY_SIZE_LIMIT) {
	switch (request.method) {
		case "GET": {
			const params = new URL(request.url).searchParams;
			if (!params.has("s") || !params.has("e") || !params.has("p")) return badRequest("Missing required query parameters.");
			const encryptedSlots = params.get("s");
			return {
				encryptedComponentExport: params.get("e"),
				encryptedProps: params.get("p"),
				encryptedSlots
			};
		}
		case "POST": try {
			const body = await readBodyWithLimit(request, bodySizeLimit);
			const raw = new TextDecoder().decode(body);
			const data = JSON.parse(raw);
			if (Object.hasOwn(data, "slots") && typeof data.slots === "object") return badRequest("Plaintext slots are not allowed. Slots must be encrypted.");
			if (Object.hasOwn(data, "componentExport") && typeof data.componentExport === "string") return badRequest("Plaintext componentExport is not allowed. componentExport must be encrypted.");
			return data;
		} catch (e) {
			if (e instanceof BodySizeLimitError) return new Response(null, {
				status: 413,
				statusText: e.message
			});
			if (e instanceof SyntaxError) return badRequest("Request format is invalid.");
			throw e;
		}
		default: return new Response(null, { status: 405 });
	}
}
function createEndpoint(manifest) {
	const page = async (result) => {
		const params = result.params;
		if (!params.name) return new Response(null, {
			status: 400,
			statusText: "Bad request"
		});
		const componentId = params.name;
		const data = await getRequestData(result.request, manifest.serverIslandBodySizeLimit);
		if (data instanceof Response) return data;
		let imp = (await (await manifest.serverIslandMappings?.())?.serverIslandMap)?.get(componentId);
		if (!imp) return new Response(null, {
			status: 404,
			statusText: "Not found"
		});
		const key = await manifest.key;
		let componentExport;
		try {
			componentExport = await decryptString(key, data.encryptedComponentExport, `export:${componentId}`);
		} catch (_e) {
			return badRequest("Encrypted componentExport value is invalid.");
		}
		const encryptedProps = data.encryptedProps;
		let props = {};
		if (encryptedProps !== "") try {
			const propString = await decryptString(key, encryptedProps, `props:${componentId}`);
			props = JSON.parse(propString);
		} catch (_e) {
			return badRequest("Encrypted props value is invalid.");
		}
		let decryptedSlots = {};
		const encryptedSlots = data.encryptedSlots;
		if (encryptedSlots !== "") try {
			const slotsString = await decryptString(key, encryptedSlots, `slots:${componentId}`);
			decryptedSlots = JSON.parse(slotsString);
		} catch (_e) {
			return badRequest("Encrypted slots value is invalid.");
		}
		let Component = (await imp())[componentExport];
		const slots = {};
		for (const prop in decryptedSlots) slots[prop] = createSlotValueFromString(decryptedSlots[prop]);
		result.response.headers.set("X-Robots-Tag", "noindex");
		if (isAstroComponentFactory(Component)) {
			const ServerIsland = Component;
			Component = function(...args) {
				return ServerIsland.apply(this, args);
			};
			Object.assign(Component, ServerIsland);
			Component.propagation = "self";
		}
		result._metadata.routeHasPropagation = true;
		const renderPropagatedHead = () => markHTMLString(result._metadata.extraHead.join(""));
		return renderTemplate`${renderPropagatedHead}${renderComponent(result, "Component", Component, props, slots)}`;
	};
	page.isAstroComponentFactory = true;
	return {
		default: page,
		partial: true
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/template/4xx.js
function template({ title, pathname, statusCode = 404, tabTitle, body }) {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>${tabTitle}</title>
		<style>
			:root {
				--gray-10: hsl(258, 7%, 10%);
				--gray-20: hsl(258, 7%, 20%);
				--gray-30: hsl(258, 7%, 30%);
				--gray-40: hsl(258, 7%, 40%);
				--gray-50: hsl(258, 7%, 50%);
				--gray-60: hsl(258, 7%, 60%);
				--gray-70: hsl(258, 7%, 70%);
				--gray-80: hsl(258, 7%, 80%);
				--gray-90: hsl(258, 7%, 90%);
				--black: #13151A;
				--accent-light: #E0CCFA;
			}

			* {
				box-sizing: border-box;
			}

			html {
				background: var(--black);
				color-scheme: dark;
				accent-color: var(--accent-light);
			}

			body {
				background-color: var(--gray-10);
				color: var(--gray-80);
				font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
				line-height: 1.5;
				margin: 0;
			}

			a {
				color: var(--accent-light);
			}

			.center {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100vw;
			}

			h1 {
				margin-bottom: 8px;
				color: white;
				font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				font-weight: 700;
				margin-top: 1rem;
				margin-bottom: 0;
			}

			.statusCode {
				color: var(--accent-light);
			}

			.astro-icon {
				height: 124px;
				width: 124px;
			}

			pre, code {
				padding: 2px 8px;
				background: rgba(0,0,0, 0.25);
				border: 1px solid rgba(255,255,255, 0.25);
				border-radius: 4px;
				font-size: 1.2em;
				margin-top: 0;
				max-width: 60em;
			}
		</style>
	</head>
	<body>
		<main class="center">
			<svg class="astro-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none"> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="white"/> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="url(#paint0_linear_738_686)"/> <path d="M0 51.6401C0 51.6401 10.6488 46.4654 21.3274 46.4654L29.3786 21.6102C29.6801 20.4082 30.5602 19.5913 31.5538 19.5913C32.5474 19.5913 33.4275 20.4082 33.7289 21.6102L41.7802 46.4654C54.4274 46.4654 63.1076 51.6401 63.1076 51.6401C63.1076 51.6401 45.0197 2.48776 44.9843 2.38914C44.4652 0.935933 43.5888 0 42.4073 0H20.7022C19.5206 0 18.6796 0.935933 18.1251 2.38914C18.086 2.4859 0 51.6401 0 51.6401Z" fill="white"/> <defs> <linearGradient id="paint0_linear_738_686" x1="31.554" y1="75.4423" x2="39.7462" y2="48.376" gradientUnits="userSpaceOnUse"> <stop stop-color="#D83333"/> <stop offset="1" stop-color="#F041FF"/> </linearGradient> </defs> </svg>
			<h1>${statusCode ? `<span class="statusCode">${statusCode}: </span> ` : ""}<span class="statusMessage">${title}</span></h1>
			${body || `
				<pre>Path: ${escape(pathname)}</pre>
			`}
			</main>
	</body>
</html>`;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/internal/astro-designed-error-pages.js
var DEFAULT_404_ROUTE = {
	component: DEFAULT_404_COMPONENT,
	params: [],
	pattern: /^\/404\/?$/,
	prerender: false,
	pathname: "/404",
	segments: [[{
		content: "404",
		dynamic: false,
		spread: false
	}]],
	type: "page",
	route: "/404",
	fallbackRoutes: [],
	isIndex: false,
	origin: "internal",
	distURL: []
};
async function default404Page({ pathname }) {
	return new Response(template({
		statusCode: 404,
		title: "Not found",
		tabTitle: "404: Not Found",
		pathname
	}), {
		status: 404,
		headers: { "Content-Type": "text/html" }
	});
}
default404Page.isAstroComponentFactory = true;
var default404Instance = { default: default404Page };
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/default.js
function createDefaultRoutes(manifest) {
	const root = new URL(manifest.rootDir);
	return [{
		instance: default404Instance,
		matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
		route: DEFAULT_404_ROUTE.route,
		component: DEFAULT_404_COMPONENT
	}, {
		instance: createEndpoint(manifest),
		matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
		route: SERVER_ISLAND_ROUTE,
		component: SERVER_ISLAND_COMPONENT
	}];
}
var defaultRoutesMemo = createManifestMemo(createDefaultRoutes);
function getDefaultRoutes(manifest) {
	return defaultRoutesMemo.get(manifest);
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/request.js
function createRequest({ url, headers, method = "GET", body = void 0, logger, isPrerendered = false, routePattern, init }) {
	const headersObj = isPrerendered ? void 0 : headers instanceof Headers ? headers : new Headers(Object.entries(headers).filter(([name]) => !name.startsWith(":")));
	if (typeof url === "string") url = new URL(url);
	if (isPrerendered) url.search = "";
	const request = new Request(url, {
		method,
		headers: headersObj,
		body: isPrerendered ? null : body,
		...init
	});
	if (isPrerendered) {
		let _headers = request.headers;
		const { value, writable, ...headersDesc } = Object.getOwnPropertyDescriptor(request, "headers") || {};
		Object.defineProperty(request, "headers", {
			...headersDesc,
			get() {
				logger.warn(null, `\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`);
				return _headers;
			},
			set(newHeaders) {
				_headers = newHeaders;
			}
		});
	}
	return request;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/util/pathname.js
var MultiLevelEncodingError = class extends Error {
	constructor() {
		super("URL encoding depth exceeded the maximum number of decode iterations");
		this.name = "MultiLevelEncodingError";
	}
};
var MAX_DECODE_ITERATIONS = 10;
function validateAndDecodePathname(pathname) {
	let decoded;
	try {
		decoded = decodeURI(pathname);
	} catch (_e) {
		throw new Error("Invalid URL encoding");
	}
	let iterations = 0;
	while (decoded !== pathname) {
		if (iterations >= MAX_DECODE_ITERATIONS) throw new MultiLevelEncodingError();
		pathname = decoded;
		try {
			decoded = decodeURI(pathname);
		} catch {
			break;
		}
		iterations++;
	}
	return decoded;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/rewrite.js
function findRouteToRewrite({ payload, routes, request, trailingSlash, buildFormat, base, outDir }) {
	let newUrl = void 0;
	if (payload instanceof URL) newUrl = payload;
	else if (payload instanceof Request) newUrl = new URL(payload.url);
	else newUrl = new URL(collapseDuplicateSlashes(payload), new URL(request.url).origin);
	const { pathname, resolvedUrlPathname } = normalizeRewritePathname(newUrl.pathname, base, trailingSlash, buildFormat);
	newUrl.pathname = resolvedUrlPathname;
	const decodedPathname = validateAndDecodePathname(pathname);
	if (isRoute404(decodedPathname)) {
		const errorRoute = routes.find((route) => route.route === "/404");
		if (errorRoute) return {
			routeData: errorRoute,
			newUrl,
			pathname: decodedPathname
		};
	}
	if (isRoute500(decodedPathname)) {
		const errorRoute = routes.find((route) => route.route === "/500");
		if (errorRoute) return {
			routeData: errorRoute,
			newUrl,
			pathname: decodedPathname
		};
	}
	let foundRoute;
	for (const route of routes) if (route.pattern.test(decodedPathname)) {
		if (route.params && route.params.length !== 0 && route.distURL && route.distURL.length !== 0) {
			if (!route.distURL.find((url) => url.href.replace(outDir.toString(), "").replace(/(?:\/index\.html|\.html)$/, "") === trimSlashes(pathname))) continue;
		}
		foundRoute = route;
		break;
	}
	if (foundRoute) return {
		routeData: foundRoute,
		newUrl,
		pathname: decodedPathname
	};
	else {
		const custom404 = routes.find((route) => route.route === "/404");
		if (custom404) return {
			routeData: custom404,
			newUrl,
			pathname
		};
		else return {
			routeData: DEFAULT_404_ROUTE,
			newUrl,
			pathname
		};
	}
}
function copyRequest(newUrl, oldRequest, isPrerendered, logger, routePattern) {
	const canHaveBody = oldRequest.method !== "GET" && oldRequest.method !== "HEAD";
	if (canHaveBody && oldRequest.bodyUsed) throw new AstroError(RewriteWithBodyUsed);
	return createRequest({
		url: newUrl,
		method: oldRequest.method,
		body: canHaveBody ? oldRequest.body : void 0,
		isPrerendered,
		logger,
		headers: isPrerendered ? {} : oldRequest.headers,
		routePattern,
		init: {
			referrer: oldRequest.referrer,
			referrerPolicy: oldRequest.referrerPolicy,
			mode: oldRequest.mode,
			credentials: oldRequest.credentials,
			cache: oldRequest.cache,
			redirect: oldRequest.redirect,
			integrity: oldRequest.integrity,
			signal: oldRequest.signal,
			keepalive: oldRequest.keepalive,
			duplex: "half"
		}
	});
}
function setOriginPathname(request, pathname, trailingSlash, buildFormat) {
	if (!pathname) pathname = "/";
	const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
	let finalPathname;
	if (pathname === "/") finalPathname = "/";
	else if (shouldAppendSlash) finalPathname = appendForwardSlash(pathname);
	else finalPathname = removeTrailingForwardSlash(pathname);
	Reflect.set(request, originPathnameSymbol, encodeURIComponent(finalPathname));
}
function getOriginPathname(request) {
	const origin = Reflect.get(request, originPathnameSymbol);
	if (origin) return decodeURIComponent(origin);
	return new URL(request.url).pathname;
}
function normalizeRewritePathname(urlPathname, base, trailingSlash, buildFormat) {
	let pathname = collapseDuplicateSlashes(urlPathname);
	const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
	if (base !== "/") {
		if (urlPathname === base || urlPathname === removeTrailingForwardSlash(base)) pathname = "/";
		else if (urlPathname.startsWith(base)) {
			pathname = shouldAppendSlash ? appendForwardSlash(urlPathname) : removeTrailingForwardSlash(urlPathname);
			pathname = pathname.slice(base.length);
		}
	}
	if (!pathname.startsWith("/") && shouldAppendSlash && urlPathname.endsWith("/")) pathname = prependForwardSlash(pathname);
	if (buildFormat === "file") pathname = pathname.replace(/\.html$/, "");
	let resolvedUrlPathname;
	if (base !== "/" && (pathname === "" || pathname === "/") && !shouldAppendSlash) resolvedUrlPathname = removeTrailingForwardSlash(base);
	else resolvedUrlPathname = joinPaths(...[base, pathname].filter(Boolean));
	return {
		pathname,
		resolvedUrlPathname
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/environment/production.js
async function getModuleForRoute(manifest, route) {
	for (const defaultRoute of getDefaultRoutes(manifest)) if (route.component === defaultRoute.component) return { page: () => Promise.resolve(defaultRoute.instance) };
	let routeToProcess = route;
	if (routeIsRedirect(route)) {
		if (route.redirectRoute) routeToProcess = route.redirectRoute;
		else return RedirectSinglePageBuiltModule;
	} else if (routeIsFallback(route)) routeToProcess = getFallbackRoute(route, manifest.routes);
	if (manifest.pageMap) {
		const importComponentInstance = manifest.pageMap.get(routeToProcess.component);
		if (!importComponentInstance) throw new Error(`Unexpectedly unable to find a component instance for route ${route.route}`);
		return await importComponentInstance();
	} else if (manifest.pageModule) return manifest.pageModule;
	throw new Error("Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue.");
}
async function getComponentByRoute(manifest, routeData) {
	return (await getModuleForRoute(manifest, routeData)).page();
}
var productionEnvironment = {
	name: "production",
	runtimeMode: "production",
	defaultStreaming: () => true,
	async resolve(manifest, specifier) {
		if (!(specifier in manifest.entryModules)) throw new Error(`Unable to resolve [${specifier}]`);
		const bundlePath = manifest.entryModules[specifier];
		if (bundlePath.startsWith("data:") || bundlePath.length === 0) return bundlePath;
		else return createAssetLink(bundlePath, manifest.base, manifest.assetsPrefix);
	},
	async headElements(manifest, routeData) {
		const { assetsPrefix, base } = manifest;
		const routeInfo = manifest.routes.find((route) => route.routeData.route === routeData.route);
		const links = /* @__PURE__ */ new Set();
		const scripts = /* @__PURE__ */ new Set();
		const styles = createStylesheetElementSet(routeInfo?.styles ?? [], base, assetsPrefix);
		for (const script of routeInfo?.scripts ?? []) if ("stage" in script) {
			if (script.stage === "head-inline") scripts.add({
				props: {},
				children: script.children
			});
		} else scripts.add(createModuleScriptElement(script, base, assetsPrefix));
		return {
			links,
			styles,
			scripts
		};
	},
	componentMetadata() {},
	getComponentByRoute,
	getModuleForRoute,
	async tryRewrite(manifest, payload, request) {
		const { newUrl, pathname, routeData } = findRouteToRewrite({
			payload,
			request,
			routes: manifest.routes.map((r) => r.routeData),
			trailingSlash: manifest.trailingSlash,
			buildFormat: manifest.buildFormat,
			base: manifest.base,
			outDir: manifest.serverLike ? manifest.buildClientDir : manifest.outDir
		});
		return {
			newUrl,
			pathname,
			componentInstance: await getComponentByRoute(manifest, routeData),
			routeData
		};
	},
	getRenderers(manifest) {
		return manifest.renderers;
	},
	errorStrategy: "default",
	injectCspMetaTagsOnErrorPages: false,
	logRequest() {}
};
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/environment/index.js
var environments = /* @__PURE__ */ new WeakMap();
function getEnvironment(manifest) {
	return environments.get(manifest) ?? productionEnvironment;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/logger/core.js
var dateTimeFormat = new Intl.DateTimeFormat([], {
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hour12: false
});
var levels = {
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	silent: 90
};
function log(opts, level, label, message, newLine = true) {
	const logLevel = opts.level;
	const dest = opts.destination;
	const event = {
		label,
		level,
		message,
		newLine
	};
	if (!isLogLevelEnabled(logLevel, level)) return;
	dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
	return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
	return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
	return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
	return log(opts, "error", label, message, newLine);
}
function debug(...args) {
	if ("_astroGlobalDebug" in globalThis) globalThis._astroGlobalDebug(...args);
}
function getEventPrefix({ level, label }) {
	const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
	const prefix = [];
	if (level === "error" || level === "warn") {
		prefix.push(colors.bold(timestamp));
		prefix.push(`[${level.toUpperCase()}]`);
	} else prefix.push(timestamp);
	if (label) prefix.push(`[${label}]`);
	if (level === "error") return colors.red(prefix.join(" "));
	if (level === "warn") return colors.yellow(prefix.join(" "));
	if (prefix.length === 1) return colors.dim(prefix[0]);
	return colors.dim(prefix[0]) + " " + colors.blue(prefix.splice(1).join(" "));
}
var AstroLogger = class {
	options;
	constructor(options) {
		this.options = options;
	}
	info(label, message, newLine = true) {
		info(this.options, label, message, newLine);
	}
	warn(label, message, newLine = true) {
		warn(this.options, label, message, newLine);
	}
	error(label, message, newLine = true) {
		error(this.options, label, message, newLine);
	}
	debug(label, ...messages) {
		debug(label, ...messages);
	}
	level() {
		return this.options.level;
	}
	forkIntegrationLogger(label) {
		return new AstroIntegrationLogger(this.options, label);
	}
	setDestination(destination) {
		this.options.destination = destination;
	}
	/**
	* It calls the `close` function of the provided destination, if it exists.
	*/
	close() {
		if (this.options.destination.close) this.options.destination.close();
	}
	/**
	* It calls the `flush` function of the provided destination, if it exists.
	*/
	flush() {
		if (this.options.destination.flush) this.options.destination.flush();
	}
};
var AstroIntegrationLogger = class AstroIntegrationLogger {
	options;
	label;
	constructor(logging, label) {
		this.options = logging;
		this.label = label;
	}
	/**
	* Creates a new logger instance with a new label, but the same log options.
	*/
	fork(label) {
		return new AstroIntegrationLogger(this.options, label);
	}
	info(message) {
		info(this.options, this.label, message);
	}
	warn(message) {
		warn(this.options, this.label, message);
	}
	error(message) {
		error(this.options, this.label, message);
	}
	debug(message) {
		debug(this.label, message);
	}
	/**
	* It calls the `flush` function of the provided destination, if it exists.
	*/
	flush() {
		if (this.options.destination.flush) this.options.destination.flush();
	}
	/**
	* It calls the `close` function of the provided destination, if it exists.
	*/
	close() {
		if (this.options.destination.close) this.options.destination.close();
	}
};
function astroToRuntimeLogger(logger) {
	return {
		info(msg) {
			logger.info(null, msg);
		},
		warn(msg) {
			logger.warn(null, msg);
		},
		error(msg) {
			logger.error(null, msg);
		}
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/logger/public.js
function matchesLevel(messageLevel, configuredLevel) {
	return levels[messageLevel] >= levels[configuredLevel];
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/logger/impls/console.js
function consoleLogDestination(config = {}) {
	const { level = "info" } = config;
	return { write(event) {
		let dest = console.error;
		if (levels[event.level] < levels["error"]) dest = console.info;
		if (!matchesLevel(event.level, level)) return;
		if (event.label === "SKIP_FORMAT") dest(event.message);
		else dest(getEventPrefix(event) + " " + event.message);
	} };
}
function createConsoleLogger({ level }) {
	return new AstroLogger({
		level,
		destination: consoleLogDestination()
	});
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/logger/manifest-logger.js
var loggers = /* @__PURE__ */ new WeakMap();
function getLogger(manifest) {
	let logger = loggers.get(manifest);
	if (!logger) {
		logger = createConsoleLogger({ level: manifest.logLevel });
		loggers.set(manifest, logger);
	}
	return logger;
}
var resolvedLogger = createAsyncManifestMemo(async (manifest) => {
	const logger = getLogger(manifest);
	try {
		const destination = (await manifest.logger?.())?.default;
		if (destination) logger.setDestination(destination);
	} catch (error) {
		logger.error("config", "Failed to load the configured logger destination; continuing with the console logger.\n" + (error instanceof Error ? error.stack ?? error.message : String(error)));
	}
	return logger;
});
function getResolvedLogger(manifest) {
	return resolvedLogger.get(manifest);
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/generator.js
function sanitizeParams(params) {
	return Object.fromEntries(Object.entries(params).map(([key, value]) => {
		if (typeof value === "string") return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
		return [key, value];
	}));
}
function getParameter(part, params) {
	if (part.spread) return params[part.content.slice(3)] ?? "";
	if (part.dynamic) {
		if (params[part.content] === void 0) throw new TypeError(`Missing parameter: ${part.content}`);
		return params[part.content];
	}
	return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
	const segmentPath = segment.map((part) => getParameter(part, params)).join("");
	return segmentPath ? collapseDuplicateLeadingSlashes("/" + segmentPath) : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
	return (params) => {
		const sanitizedParams = sanitizeParams(params);
		let trailing = "";
		if (addTrailingSlash === "always" && segments.length) trailing = "/";
		return segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing || "/";
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/internal/validation.js
var VALID_PARAM_TYPES = ["string", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
	if (!VALID_PARAM_TYPES.includes(typeof value)) throw new AstroError({
		...GetStaticPathsInvalidRouteParam,
		message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
		location: { file: route }
	});
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/params.js
function stringifyParams(params, route, trailingSlash) {
	if (route.type === "endpoint" && hasFileExtension(route.route)) trailingSlash = "never";
	const validatedParams = {};
	for (const [key, value] of Object.entries(params)) {
		validateGetStaticPathsParameter([key, value], route.component);
		if (value !== void 0) validatedParams[key] = trimSlashes(value);
	}
	return getRouteGenerator(route.segments, trailingSlash)(validatedParams);
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/routing/validation.js
function validateDynamicRouteModule(mod, { ssr, route }) {
	if ((!ssr || route.prerender) && route.origin !== "internal" && !mod.getStaticPaths) throw new AstroError({
		...GetStaticPathsRequired,
		location: { file: route.component }
	});
}
function validateGetStaticPathsResult(result, route) {
	if (!Array.isArray(result)) throw new AstroError({
		...InvalidGetStaticPathsReturn,
		message: InvalidGetStaticPathsReturn.message(typeof result),
		location: { file: route.component }
	});
	result.forEach((pathObject) => {
		if (typeof pathObject === "object" && Array.isArray(pathObject) || pathObject === null) throw new AstroError({
			...InvalidGetStaticPathsEntry,
			message: InvalidGetStaticPathsEntry.message(Array.isArray(pathObject) ? "array" : typeof pathObject)
		});
		if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) throw new AstroError({
			...GetStaticPathsExpectedParams,
			location: { file: route.component }
		});
	});
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/render/paginate.js
function generatePaginateFunction(routeMatch, base, trailingSlash) {
	return function paginateUtility(data, args = {}) {
		const generate = getRouteGenerator(routeMatch.segments, trailingSlash);
		let { pageSize: _pageSize, params: _params, props: _props, format: _format } = args;
		const pageSize = _pageSize || 10;
		const paramName = "page";
		const additionalParams = _params || {};
		const additionalProps = _props || {};
		const formatUrl = _format || ((url) => url);
		let includesFirstPageNumber;
		if (routeMatch.params.includes(`...${paramName}`)) includesFirstPageNumber = false;
		else if (routeMatch.params.includes(`${paramName}`)) includesFirstPageNumber = true;
		else throw new AstroError({
			...PageNumberParamNotFound,
			message: PageNumberParamNotFound.message(paramName)
		});
		const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
		return [...Array(lastPage).keys()].map((num) => {
			const pageNum = num + 1;
			const start = pageSize === Number.POSITIVE_INFINITY ? 0 : (pageNum - 1) * pageSize;
			const end = Math.min(start + pageSize, data.length);
			const params = {
				...additionalParams,
				[paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
			};
			const current = formatUrl(addRouteBase(generate({ ...params }), base));
			const next = pageNum === lastPage ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: String(pageNum + 1)
			}), base));
			const prev = pageNum === 1 ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
			}), base));
			const first = pageNum === 1 ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: includesFirstPageNumber ? "1" : void 0
			}), base));
			const last = pageNum === lastPage ? void 0 : formatUrl(addRouteBase(generate({
				...params,
				page: String(lastPage)
			}), base));
			return {
				params,
				props: {
					...additionalProps,
					page: {
						data: data.slice(start, end),
						start,
						end: end - 1,
						size: pageSize,
						total: data.length,
						currentPage: pageNum,
						lastPage,
						url: {
							current,
							next,
							prev,
							first,
							last
						}
					}
				}
			};
		});
	};
}
function addRouteBase(route, base) {
	let routeWithBase = joinPaths(base, route);
	if (routeWithBase === "") routeWithBase = "/";
	return routeWithBase;
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/render/route-cache.js
async function callGetStaticPaths({ mod, route, routeCache, ssr, base, trailingSlash }) {
	const cached = routeCache.get(route);
	if (!mod) throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
	if (cached?.staticPaths && cached.mod === mod) return cached.staticPaths;
	validateDynamicRouteModule(mod, {
		ssr,
		route
	});
	if (ssr && !route.prerender || route.origin === "internal") {
		const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
		routeCache.set(route, {
			...cached,
			mod,
			staticPaths: entry
		});
		return entry;
	}
	let staticPaths = [];
	if (!mod.getStaticPaths) throw new Error("Unexpected Error.");
	staticPaths = await mod.getStaticPaths({
		paginate: generatePaginateFunction(route, base, trailingSlash),
		routePattern: route.route
	});
	validateGetStaticPathsResult(staticPaths, route);
	const keyedStaticPaths = staticPaths;
	keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
	for (const sp of keyedStaticPaths) {
		const paramsKey = stringifyParams(sp.params, route, trailingSlash);
		keyedStaticPaths.keyed.set(paramsKey, sp);
	}
	routeCache.set(route, {
		...cached,
		mod,
		staticPaths: keyedStaticPaths
	});
	return keyedStaticPaths;
}
var RouteCache = class {
	logger;
	cache = {};
	runtimeMode;
	constructor(logger, runtimeMode = "production") {
		this.logger = logger;
		this.runtimeMode = runtimeMode;
	}
	/** Clear the cache. */
	clearAll() {
		this.cache = {};
	}
	set(route, entry) {
		const key = this.key(route);
		if (this.runtimeMode === "production" && this.cache[key]?.staticPaths) this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
		this.cache[key] = entry;
	}
	get(route) {
		return this.cache[this.key(route)];
	}
	key(route) {
		return `${route.route}_${route.component}`;
	}
};
var routeCaches = createManifestMemo((manifest) => new RouteCache(getLogger(manifest), getEnvironment(manifest).runtimeMode));
function getRouteCache(manifest) {
	return routeCaches.get(manifest);
}
function findPathItemByKey(staticPaths, params, route, logger, trailingSlash) {
	const paramsKey = stringifyParams(params, route, trailingSlash);
	const matchedStaticPath = staticPaths.keyed.get(paramsKey);
	if (matchedStaticPath) return matchedStaticPath;
	logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/render/params-and-props.js
async function getProps(opts) {
	const { logger, mod, routeData: route, routeCache, pathname, serverLike, base, trailingSlash } = opts;
	if (!route || route.pathname) return {};
	if (routeIsRedirect(route) || routeIsFallback(route) || route.component === "astro-default-404.astro") return {};
	const staticPaths = await callGetStaticPaths({
		mod,
		route,
		routeCache,
		ssr: serverLike,
		base,
		trailingSlash
	});
	const params = getParams(route, pathname);
	const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger, trailingSlash);
	if (!matchedStaticPath && route.origin !== "internal" && (serverLike ? route.prerender : true)) throw new AstroError({
		...NoMatchingStaticPathFound,
		message: NoMatchingStaticPathFound.message(pathname),
		hint: NoMatchingStaticPathFound.hint([route.component])
	});
	if (mod) validatePrerenderEndpointCollision(route, mod, params);
	return matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
}
function getParams(route, pathname) {
	if (!route.params.length) return {};
	const hasHtmlSuffix = pathname.endsWith(".html") && !routeHasHtmlExtension(route);
	const path = hasHtmlSuffix && route.type === "page" ? pathname.slice(0, -5) : pathname;
	const allPatterns = [route, ...route.fallbackRoutes].map((r) => r.pattern);
	let paramsMatch = allPatterns.map((pattern) => pattern.exec(path)).find((x) => x);
	if (!paramsMatch && hasHtmlSuffix && route.type !== "page") {
		const strippedPath = pathname.endsWith("/index.html") ? pathname.slice(0, -11) || "/" : pathname.slice(0, -5);
		paramsMatch = allPatterns.map((pattern) => pattern.exec(strippedPath)).find((x) => x);
	}
	if (!paramsMatch) return {};
	const params = {};
	route.params.forEach((key, i) => {
		if (key.startsWith("...")) params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
		else params[key] = paramsMatch[i + 1];
	});
	return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
	if (route.type === "endpoint" && mod.getStaticPaths) {
		const lastSegment = route.segments[route.segments.length - 1];
		const paramValues = Object.values(params);
		const lastParam = paramValues[paramValues.length - 1];
		if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) throw new AstroError({
			...PrerenderDynamicEndpointPathCollide,
			message: PrerenderDynamicEndpointPathCollide.message(route.route),
			hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
			location: { file: route.component }
		});
	}
}
//#endregion
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/core/middleware/sequence.js
function sequence(...handlers) {
	const filtered = handlers.filter((h) => !!h);
	const length = filtered.length;
	if (!length) return defineMiddleware((_context, next) => {
		return next();
	});
	return defineMiddleware((context, next) => {
		let carriedPayload = void 0;
		return applyHandle(0, context);
		function applyHandle(i, handleContext) {
			const handle = filtered[i];
			return handle(handleContext, async (payload) => {
				if (i < length - 1) {
					if (payload) {
						const oldPathname = handleContext.url.pathname;
						const state = Reflect.get(handleContext, fetchStateSymbol);
						if (!state) throw new Error("FetchState not found on APIContext. `next(payload)` rewrites require a context created through Astro's request pipeline.");
						const manifest = state.manifest;
						const { routeData, pathname } = await getEnvironment(manifest).tryRewrite(manifest, payload, handleContext.request);
						let newRequest;
						if (payload instanceof Request) newRequest = payload;
						else {
							const request = handleContext.request.method === "GET" || handleContext.request.method === "HEAD" ? handleContext.request : handleContext.request.clone();
							newRequest = copyRequest(payload instanceof URL ? payload : new URL(payload, handleContext.url.origin), request, false, state.logger, routeData.route);
						}
						if (manifest.serverLike === true && handleContext.isPrerendered === false && routeData.prerender === true) throw new AstroError({
							...ForbiddenRewrite,
							message: ForbiddenRewrite.message(handleContext.url.pathname, pathname, routeData.component),
							hint: ForbiddenRewrite.hint(routeData.component)
						});
						carriedPayload = payload;
						handleContext.request = newRequest;
						handleContext.url = new URL(newRequest.url);
						handleContext.params = getParams(routeData, pathname);
						handleContext.routePattern = routeData.route;
						setOriginPathname(handleContext.request, oldPathname, manifest.trailingSlash, manifest.buildFormat);
					}
					return applyHandle(i + 1, handleContext);
				} else return next(payload ?? carriedPayload);
			});
		}
	});
}
//#endregion
export { pathHasLocale as A, joinPaths as B, getCustom404Route as C, getErrorRoutePath as D, routeHasHtmlExtension as E, collapseDuplicateTrailingSlashes as F, slash as G, removeLeadingForwardSlash as H, hasFileExtension as I, stripRequestBase as K, isInternalPath as L, defineMiddleware as M, appendForwardSlash as N, normalizeTheLocale as O, collapseDuplicateSlashes as P, isParentDirectory as R, createManifestMemo as S, getDefaultStatusCode as T, removeQueryString as U, prependForwardSlash as V, removeTrailingForwardSlash as W, DEFAULT_404_ROUTE as _, getRouteGenerator as a, readBodyWithLimit as b, createConsoleLogger as c, getEnvironment as d, copyRequest as f, validateAndDecodePathname as g, MultiLevelEncodingError as h, getRouteCache as i, shouldAppendForwardSlash as j, normalizeThePath as k, AstroIntegrationLogger as l, setOriginPathname as m, getParams as n, getLogger as o, getOriginPathname as p, getProps as r, getResolvedLogger as s, sequence as t, astroToRuntimeLogger as u, SERVER_ISLAND_COMPONENT as v, getCustom500Route as w, createAsyncManifestMemo as x, BodySizeLimitError as y, isRemotePath as z };
