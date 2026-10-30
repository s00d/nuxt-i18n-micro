import { R as AstroError, ht as NoImageMetadata, kt as UnsupportedImageFormat, mt as MissingSharp } from "./server_Dx_4z2w4.mjs";
import { a as resolveDefaultOutputFormat, i as detector, n as baseService, r as parseQuality } from "./node_Csi-5nq3.mjs";
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/assets/services/sharp.js
var sharp;
var qualityTable = {
	low: 25,
	mid: 50,
	high: 80,
	max: 100
};
function resolveSharpQuality(quality) {
	if (!quality) return void 0;
	const parsedQuality = parseQuality(quality);
	if (typeof parsedQuality === "number") return parsedQuality;
	return quality in qualityTable ? qualityTable[quality] : void 0;
}
function resolveSharpEncoderOptions(transform, inputFormat, serviceConfig = {}) {
	const quality = resolveSharpQuality(transform.quality);
	if (transform.format === void 0) return quality === void 0 ? void 0 : { quality };
	switch (transform.format) {
		case "jpg":
		case "jpeg": return {
			...serviceConfig.jpeg,
			...quality === void 0 ? {} : { quality }
		};
		case "png": return {
			...serviceConfig.png,
			...quality === void 0 ? {} : { quality }
		};
		case "webp": {
			const webpOptions = {
				...serviceConfig.webp,
				...quality === void 0 ? {} : { quality }
			};
			if (inputFormat === "gif") webpOptions.loop ??= 0;
			return webpOptions;
		}
		case "avif": return {
			...serviceConfig.avif,
			...quality === void 0 ? {} : { quality }
		};
		default: return quality === void 0 ? void 0 : { quality };
	}
}
async function loadSharp() {
	let sharpImport;
	try {
		sharpImport = (await import("sharp")).default;
	} catch {
		throw new AstroError(MissingSharp);
	}
	sharpImport.cache(false);
	return sharpImport;
}
var fitMap = {
	fill: "fill",
	contain: "inside",
	cover: "cover",
	none: "outside",
	"scale-down": "inside",
	outside: "outside",
	inside: "inside"
};
var sharp_default = {
	validateOptions: baseService.validateOptions,
	getURL: baseService.getURL,
	parseURL: baseService.parseURL,
	getHTMLAttributes: baseService.getHTMLAttributes,
	getSrcSet: baseService.getSrcSet,
	getRemoteSize: baseService.getRemoteSize,
	async transform(inputBuffer, transformOptions, config, logger) {
		if (!sharp) sharp = await loadSharp();
		const transform = transformOptions;
		const kernel = config.service.config.kernel;
		const bufferFormat = detector(inputBuffer);
		const outputFormat = transform.format ?? resolveDefaultOutputFormat(bufferFormat);
		if (outputFormat === "svg") {
			if (bufferFormat && bufferFormat !== "svg") {
				logger.warn(`Astro expected an SVG for "${transform.src}" but the source is ${bufferFormat}. Passing it through as ${bufferFormat} instead.`);
				return {
					data: inputBuffer,
					format: bufferFormat
				};
			}
			return {
				data: inputBuffer,
				format: "svg"
			};
		}
		if (!bufferFormat) throw new AstroError({
			...NoImageMetadata,
			message: NoImageMetadata.message(transform.src)
		});
		if (bufferFormat === "svg" && !config.dangerouslyProcessSVG) throw new AstroError({
			...UnsupportedImageFormat,
			message: `SVG image processing is disabled, but the source for "${transform.src}" is an SVG. Pass it through unchanged by setting \`format="svg"\` on the component, or set \`image.dangerouslyProcessSVG: true\` to rasterize SVG sources.`
		});
		const result = sharp(inputBuffer, {
			failOn: "none",
			pages: -1,
			limitInputPixels: config.service.config.limitInputPixels
		});
		result.rotate();
		if (transform.width && transform.height) {
			const fit = transform.fit ? fitMap[transform.fit] ?? "inside" : void 0;
			result.resize({
				width: Math.round(transform.width),
				height: Math.round(transform.height),
				kernel,
				fit,
				position: transform.position,
				withoutEnlargement: true
			});
		} else if (transform.height && !transform.width) result.resize({
			height: Math.round(transform.height),
			withoutEnlargement: true,
			kernel
		});
		else if (transform.width) result.resize({
			width: Math.round(transform.width),
			withoutEnlargement: true,
			kernel
		});
		if (transform.background) result.flatten({ background: transform.background });
		const encoderOptions = resolveSharpEncoderOptions({
			format: outputFormat,
			quality: transform.quality
		}, bufferFormat, config.service.config);
		if (outputFormat === "webp") result.webp(encoderOptions);
		else if (outputFormat === "png") result.png(encoderOptions);
		else if (outputFormat === "avif") result.avif(encoderOptions);
		else if (outputFormat === "jpeg" || outputFormat === "jpg") result.jpeg(encoderOptions);
		else result.toFormat(outputFormat, encoderOptions);
		let data;
		let info;
		try {
			({data, info} = await result.toBuffer({ resolveWithObject: true }));
		} catch {
			logger.warn(`Astro could not optimize image "${transform.src}". Sharp doesn't support this format. The image will be used unoptimized. Consider converting to WebP or placing in the public/ folder.`);
			return {
				data: inputBuffer,
				format: bufferFormat
			};
		}
		return {
			data: "buffer" in data && data.buffer instanceof SharedArrayBuffer ? new Uint8Array(data) : data,
			format: info.format
		};
	}
};
//#endregion
export { sharp_default as default, resolveSharpEncoderOptions };
