/**
 * Site entry point.
 * Each feature is isolated in its own module-like function and only
 * initialised if the required DOM nodes actually exist on the page.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
	initSmoothScroll();
	initServicesSlider();
	initTicker();
	initScrollToTop();
	initBurgerMenu();
	headerPopup();
	cookiePopup();
	tgButton();
});

/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis)                                              */
/* ------------------------------------------------------------------ */

function initSmoothScroll() {
	if (typeof Lenis === 'undefined') return;

	const lenis = new Lenis({
		lerp: 0.08,
		smooth: true,
		direction: 'vertical',
		smoothWheel: true,
		smoothTouch: false,
		infinite: false,
	});

	let rafId = null;

	function raf(time) {
		lenis.raf(time);
		rafId = requestAnimationFrame(raf);
	}

	window.addEventListener('load', () => {
		rafId = requestAnimationFrame(raf);

		// Forces layout recalculation once assets have loaded so Lenis
		// gets the correct scroll height. Runs once, not on every frame.
		requestAnimationFrame(() => {
			document.body.style.height = `${document.body.scrollHeight}px`;
		});
	});

	// Avoid burning CPU on background tabs.
	document.addEventListener('visibilitychange', () => {
		if (document.hidden && rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		} else if (!document.hidden && rafId === null) {
			rafId = requestAnimationFrame(raf);
		}
	});
}

/* ------------------------------------------------------------------ */
/* Services slider (Swiper)                                           */
/* ------------------------------------------------------------------ */

function initServicesSlider() {
	const container = document.querySelector('.services-block__list .swiper');
	if (!container || typeof Swiper === 'undefined') return;

	new Swiper(container, {
		slidesPerView: 4,
		spaceBetween: 12,
		loop: false,
		watchSlidesVisibility: true,
		watchSlidesProgress: true,
		lazy: {
			loadPrevNext: true,
			loadPrevNextAmount: 2,
		},
		navigation: {
			nextEl: '.services-block__controls .swiper-button-next',
			prevEl: '.services-block__controls .swiper-button-prev',
		},
		pagination: {
			el: '.services-block__pagination.swiper-pagination',
			clickable: true,
		},
		breakpoints: {
			0: { slidesPerView: 1 },
			640: { slidesPerView: 2 },
			980: { slidesPerView: 3 },
			1100: { slidesPerView: 4 },
		},
	});
}

/* ------------------------------------------------------------------ */
/* Ticker / marquee                                                   */
/* ------------------------------------------------------------------ */

const TICKER_SPEED_PX_PER_SEC = 58;

function initTicker() {
	const ticker = document.querySelector('.ticker-block');
	const wrap = ticker?.querySelector('.ticker-block__inner');
	if (!ticker || !wrap) return;

	cloneItemsToFillViewport(wrap, ticker);

	const loopWidth = wrap.scrollWidth / getCloneMultiplier(wrap);
	const controller = createTickerAnimation(wrap, loopWidth, TICKER_SPEED_PX_PER_SEC);

	ticker.addEventListener('mouseenter', controller.stop);
	ticker.addEventListener('mouseleave', controller.start);
	document.addEventListener('visibilitychange', () => {
		document.hidden ? controller.stop() : controller.start();
	});

	controller.start();
}

/**
 * Duplicates the ticker items enough times to cover at least
 * 2x the container width, so the loop never shows empty space.
 */
function cloneItemsToFillViewport(wrap, ticker) {
	const originalItems = Array.from(wrap.children);
	const originalWidth = wrap.scrollWidth;
	const tickerWidth = ticker.offsetWidth;

	const setsNeeded = Math.max(2, Math.ceil((tickerWidth * 2) / originalWidth) + 1);

	const fragment = document.createDocumentFragment();
	for (let i = 0; i < setsNeeded - 1; i++) {
		originalItems.forEach((el) => fragment.appendChild(el.cloneNode(true)));
	}
	wrap.appendChild(fragment); // single reflow instead of one per clone

	wrap.dataset.cloneSets = String(setsNeeded);
}

function getCloneMultiplier(wrap) {
	return Number(wrap.dataset.cloneSets) || 1;
}

/**
 * Creates a GPU-friendly translate3d loop animation with start/stop controls.
 */
function createTickerAnimation(wrap, loopWidth, speedPxPerSec) {
	let rafId = null;
	let position = 0;
	let lastTime = null;

	wrap.style.willChange = 'transform';
	wrap.style.transform = 'translate3d(0, 0, 0)';

	function tick(timestamp) {
		if (lastTime === null) lastTime = timestamp;
		const delta = timestamp - lastTime;
		lastTime = timestamp;

		position = (position + (speedPxPerSec * delta) / 1000) % loopWidth;
		wrap.style.transform = `translate3d(${-position}px, 0, 0)`;

		rafId = requestAnimationFrame(tick);
	}

	return {
		start() {
			if (rafId === null) {
				lastTime = null;
				rafId = requestAnimationFrame(tick);
			}
		},
		stop() {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		},
	};
}

/* ------------------------------------------------------------------ */
/* Scroll to top                                                      */
/* ------------------------------------------------------------------ */

function initScrollToTop() {
	const toTopBtn = document.querySelector('.site-footer__to-top-btn a');
	if (!toTopBtn) return;

	toTopBtn.addEventListener('click', (e) => {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
}

/* ------------------------------------------------------------------ */
/* Burger menu                                                        */
/* ------------------------------------------------------------------ */

const MOBILE_BREAKPOINT = 1260;

function initBurgerMenu() {
	const burgerBtn = document.querySelector('.site-header__burger-btn a');
	const burgerCloser = document.querySelector('.burger-menu__closer a');
	const burgerMenu = document.querySelector('.burger-menu');
	const headerMenuContainer = document.querySelector('.site-header__menu');
	const headerMenu = headerMenuContainer?.querySelector('nav');
	const burgerMenuInner = burgerMenu?.querySelector('.burger-menu__inner');
	const messengers = document.querySelector('.site-header__messengers');

	// Bail out cleanly if the header markup isn't present on this page.
	if (!burgerBtn || !burgerCloser || !burgerMenu || !headerMenuContainer || !headerMenu || !burgerMenuInner) {
		return;
	}

	const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

	function isMobileView() {
		return mediaQuery.matches || (typeof IsMobile !== 'undefined' && IsMobile);
	}

	function closeMenu() {
		burgerMenu.classList.remove('opened');
		document.documentElement.classList.remove('overflow_hidden');
	}

	function updateMenuPosition() {
		const target = isMobileView() ? burgerMenuInner : headerMenuContainer;
		if (!target.contains(headerMenu)) {
			target.appendChild(headerMenu);
			target.appendChild(messengers);
		}
		if (!isMobileView()) {
			closeMenu();
		}
	}

	updateMenuPosition();

	burgerBtn.addEventListener('click', () => {
		burgerMenu.classList.toggle('opened');
		document.documentElement.classList.add('overflow_hidden');
	});

	burgerCloser.addEventListener('click', closeMenu);

	document.addEventListener('click', (e) => {
		const isOpen = burgerMenu.classList.contains('opened');
		const clickedInsideMenu = burgerMenuInner.contains(e.target);
		const clickedToggleBtn = burgerBtn.contains(e.target);

		if (isOpen && !clickedInsideMenu && !clickedToggleBtn) {
			closeMenu();
		}
	});

	window.addEventListener('resize', debounce(updateMenuPosition, 150));
}

/* ------------------------------------------------------------------ */
/* Header popup                                                       */
/* ------------------------------------------------------------------ */

function headerPopup() {
	const popupBtn = document.querySelector('.popup-btn');
	const popupForm = document.querySelectorAll('.popup-form-block');
	const popupCloser = document.querySelectorAll('.popup-form-block__closer');

	if(!popupBtn) return;

	popupBtn.addEventListener('click', (e) => {
		e.preventDefault();
		console.log(1)
		const dataForm = popupBtn.dataset.popup;

		popupForm.forEach((formItem) => {
			if(dataForm == formItem.dataset.popup) {
				formItem.classList.add('opened')
				document.documentElement.classList.add('overflow_hidden');
			}
		})
	})

	function closeMenu() {
		popupForm.forEach((el) => el.classList.remove('opened'));
		document.documentElement.classList.remove('overflow_hidden');
	}

	document.addEventListener('click', (e) => {
		const openedForm = document.querySelector('.popup-form-block.opened');

		if (!openedForm) return;

		const modalContent = openedForm.querySelector('.popup-form-block__body');

		if (!modalContent.contains(e.target) && !popupBtn.contains(e.target)) {
			closeMenu();
		}
	});

	popupCloser.forEach((closeBtn) => {
		closeBtn.addEventListener('click', closeMenu)
	})

	
}

/* ------------------------------------------------------------------ */
/* Cookie popup                                                       */
/* ------------------------------------------------------------------ */

function cookiePopup() {
	const cookieBlock = document.querySelector('.cookie-block');

	if (!cookieBlock) return;

	function getCookie(name) {
		const matches = document.cookie.match(
			new RegExp(
				"(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
			)
		);

		return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

		document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
	}

	if (!getCookie('cookieAccepted')) {
		cookieBlock.classList.add('opened');
	}

	document.querySelector('.cookie-block__accept').addEventListener('click', function () {
		cookieBlock.classList.remove('opened');
		setCookie('cookieAccepted', '1', 365); 
	});
}

/* ------------------------------------------------------------------ */
/* TG button                                                          */
/* ------------------------------------------------------------------ */

function tgButton() {
	const button = document.querySelector('.tg-button-block__closer a');
	const message = document.querySelector('.tg-button-block__message');

	if(!button) return;

	button.addEventListener('click', () => {
		message.classList.add('hide')
	})
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}