import { t as sequence } from "./chunks/sequence_DMp7Qai3.mjs";
import { r as s, t as j } from "./chunks/middleware-5NzrkLDL_oNfUmemX.mjs";
//#region \0virtual:i18n-micro/config
var config = {
	"defaultLocale": "en",
	"fallbackLocale": "en",
	"locales": [
		{
			"code": "en",
			"iso": "en-US",
			"displayName": "English"
		},
		{
			"code": "fr",
			"iso": "fr-FR",
			"displayName": "Français"
		},
		{
			"code": "de",
			"iso": "de-DE",
			"displayName": "Deutsch"
		},
		{
			"code": "es",
			"iso": "es-ES",
			"displayName": "Español",
			"disabled": true
		}
	],
	"localeCodes": [
		"en",
		"fr",
		"de"
	],
	"translationDir": "src/locales",
	"autoDetect": true,
	"redirectToDefault": false,
	"localeCookie": "i18n-locale",
	"missingWarn": false,
	"base": "/docs"
};
//#endregion
//#region \0virtual:i18n-micro/messages
var messages = {
	"root": {
		"de": {
			"welcome": "Willkommen",
			"greeting": "Hallo, {name}!",
			"apples": "keine Äpfel | ein Apfel | {count} Äpfel",
			"number": "Zahl: {number}",
			"date": "Datum: {date}",
			"relativeDate": "Relativ: {relativeDate}",
			"home": {
				"title": "Startseite",
				"description": "Dies ist die Startseite"
			},
			"about": {
				"title": "Über uns",
				"description": "Dies ist die Über uns Seite"
			},
			"components": {
				"title": "Komponenten Demo",
				"description": "Demo aller i18n Komponenten"
			},
			"nav": {
				"home": "Startseite",
				"about": "Über uns",
				"components": "Komponenten",
				"islands": "Inseln"
			},
			"islands": {
				"title": "Astro Islands Demo",
				"description": "Diese Seite demonstriert die i18n-Integration mit Astro Islands (Vue, React, Svelte, Preact). Jede Insel erhält Übersetzungen über Props und verwendet ihren Framework-spezifischen Adapter.",
				"vue": {
					"title": "Vue Insel",
					"description": "Dies ist eine Vue-Komponente, die das provide/inject-Muster für i18n verwendet."
				},
				"react": {
					"title": "React Insel",
					"description": "Dies ist eine React-Komponente, die Context API für i18n verwendet."
				},
				"svelte": {
					"title": "Svelte Insel",
					"description": "Dies ist eine Svelte-Komponente, die Svelte Stores für i18n verwendet."
				},
				"preact": {
					"title": "Preact Insel",
					"description": "Dies ist eine Preact-Komponente, die Context API für i18n verwendet."
				},
				"apples": "keine Äpfel | ein Apfel | {count} Äpfel",
				"number": "Zahl: {number}"
			}
		},
		"en": {
			"welcome": "Welcome",
			"greeting": "Hello, {name}!",
			"apples": "no apples | one apple | {count} apples",
			"number": "Number: {number}",
			"date": "Date: {date}",
			"relativeDate": "Relative: {relativeDate}",
			"home": {
				"title": "Home Page",
				"description": "This is the home page"
			},
			"about": {
				"title": "About Page",
				"description": "This is the about page"
			},
			"components": {
				"title": "Components Demo",
				"description": "Demo of all i18n components"
			},
			"nav": {
				"home": "Home",
				"about": "About",
				"components": "Components",
				"islands": "Islands"
			},
			"islands": {
				"title": "Astro Islands Demo",
				"description": "This page demonstrates i18n integration with Astro Islands (Vue, React, Svelte, Preact). Each island receives translations through props and uses its framework-specific adapter.",
				"vue": {
					"title": "Vue Island",
					"description": "This is a Vue component using provide/inject pattern for i18n."
				},
				"react": {
					"title": "React Island",
					"description": "This is a React component using Context API for i18n."
				},
				"svelte": {
					"title": "Svelte Island",
					"description": "This is a Svelte component using Svelte stores for i18n."
				},
				"preact": {
					"title": "Preact Island",
					"description": "This is a Preact component using Context API for i18n."
				},
				"apples": "no apples | one apple | {count} apples",
				"number": "Number: {number}"
			}
		},
		"fr": {
			"welcome": "Bienvenue",
			"greeting": "Bonjour, {name}!",
			"apples": "pas de pommes | une pomme | {count} pommes",
			"number": "Nombre: {number}",
			"date": "Date: {date}",
			"relativeDate": "Relatif: {relativeDate}",
			"home": {
				"title": "Page d'accueil",
				"description": "Ceci est la page d'accueil"
			},
			"about": {
				"title": "Page À propos",
				"description": "Ceci est la page À propos"
			},
			"components": {
				"title": "Démo des composants",
				"description": "Démo de tous les composants i18n"
			},
			"nav": {
				"home": "Accueil",
				"about": "À propos",
				"components": "Composants",
				"islands": "Îles"
			},
			"islands": {
				"title": "Démo Astro Islands",
				"description": "Cette page démontre l'intégration i18n avec Astro Islands (Vue, React, Svelte, Preact). Chaque île reçoit les traductions via props et utilise son adaptateur spécifique au framework.",
				"vue": {
					"title": "Île Vue",
					"description": "Ceci est un composant Vue utilisant le pattern provide/inject pour i18n."
				},
				"react": {
					"title": "Île React",
					"description": "Ceci est un composant React utilisant Context API pour i18n."
				},
				"svelte": {
					"title": "Île Svelte",
					"description": "Ceci est un composant Svelte utilisant Svelte stores pour i18n."
				},
				"preact": {
					"title": "Île Preact",
					"description": "Ceci est un composant Preact utilisant Context API pour i18n."
				},
				"apples": "pas de pommes | une pomme | {count} pommes",
				"number": "Nombre: {number}"
			}
		}
	},
	"routes": { "blog-slug": {
		"de": { "post": { "title": "Beitragsseite" } },
		"en": { "post": { "title": "Post page" } }
	} }
};
//#endregion
//#region ../dist/middleware.js
var i = new s({
	locale: config.defaultLocale,
	fallbackLocale: config.fallbackLocale,
	missingWarn: config.missingWarn
});
i.loadMessages(messages.root, messages.routes);
var a = j({
	i18n: i,
	defaultLocale: config.defaultLocale,
	locales: config.localeCodes,
	localeObjects: config.locales,
	autoDetect: config.autoDetect,
	redirectToDefault: config.redirectToDefault,
	localeCookie: config.localeCookie,
	base: config.base
});
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(a);
//#endregion
export { onRequest };
