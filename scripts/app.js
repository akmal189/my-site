'use strict';

class App {
	constructor() {
		this.modules = [];
	}

	init() {
		this.modules = [
			new SmoothScroll(),
			new ServicesSlider(),
			new Ticker(),
			new ScrollToTop(),
			new BurgerMenu(),
			new PopupForms(),
			new CookiePopup(),
			new TelegramButton(),
			new FaqBlock(),
			new FaqBlockMain(),
			new SiteAnimations(),
			new ReviewsSlider(),
		];

		this.modules.forEach(module => module.init());
	}

	destroy() {
		this.modules.forEach(module => {
			if (module.destroy) module.destroy();
		});
	}
}

/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis)                                              */
/* ------------------------------------------------------------------ */

class SmoothScroll {
	constructor() {
		this.lenis = null;
		this.rafId = null;
	}

	init() {
		if (typeof Lenis === 'undefined') return;

		this.lenis = new Lenis({
			lerp: 0.08,
			smooth: true,
			direction: 'vertical',
			smoothWheel: true,
			smoothTouch: false,
			infinite: false,
		});

		this.setupEventListeners();
	}

	setupEventListeners() {
		window.addEventListener('load', () => this.onLoad());
		document.addEventListener('visibilitychange', () => this.onVisibilityChange());
	}

	onLoad() {
		this.rafId = requestAnimationFrame((time) => this.raf(time));

		requestAnimationFrame(() => {
			document.body.style.height = `${document.body.scrollHeight}px`;
		});
	}

	raf(time) {
		this.lenis.raf(time);
		this.rafId = requestAnimationFrame((t) => this.raf(t));
	}

	onVisibilityChange() {
		if (document.hidden && this.rafId !== null) {
			this.stop();
		} else if (!document.hidden && this.rafId === null) {
			this.start();
		}
	}

	start() {
		this.rafId = requestAnimationFrame((time) => this.raf(time));
	}

	stop() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	destroy() {
		this.stop();
		if (this.lenis) {
			this.lenis.destroy();
		}
	}
}

/* ------------------------------------------------------------------ */
/* Services slider (Swiper)                                           */
/* ------------------------------------------------------------------ */

class ServicesSlider {
	constructor() {
		this.container = document.querySelector('.services-block__list .swiper');
		this.swiper = null;
	}

	init() {
		if (!this.container || typeof Swiper === 'undefined') return;

		this.swiper = new Swiper(this.container, {
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

	destroy() {
		if (this.swiper) {
			this.swiper.destroy();
		}
	}
}

/* ------------------------------------------------------------------ */
/* Ticker / marquee                                                   */
/* ------------------------------------------------------------------ */

class Ticker {
	constructor() {
		this.ticker = document.querySelector('.ticker-block');
		this.wrap = this.ticker?.querySelector('.ticker-block__inner');
		this.speedPxPerSec = 58;
		this.controller = null;
	}

	init() {
		if (!this.ticker || !this.wrap) return;

		this.cloneItemsToFillViewport();

		const loopWidth = this.wrap.scrollWidth / this.getCloneMultiplier();
		this.controller = this.createAnimation(loopWidth);

		this.setupEventListeners();
		this.controller.start();
	}

	setupEventListeners() {
		this.ticker.addEventListener('mouseenter', () => this.controller.stop());
		this.ticker.addEventListener('mouseleave', () => this.controller.start());
		document.addEventListener('visibilitychange', () => {
			document.hidden ? this.controller.stop() : this.controller.start();
		});
	}

	cloneItemsToFillViewport() {
		const originalItems = Array.from(this.wrap.children);
		const originalWidth = this.wrap.scrollWidth;
		const tickerWidth = this.ticker.offsetWidth;

		const setsNeeded = Math.max(2, Math.ceil((tickerWidth * 2) / originalWidth) + 1);

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < setsNeeded - 1; i++) {
			originalItems.forEach((el) => fragment.appendChild(el.cloneNode(true)));
		}
		this.wrap.appendChild(fragment);
		this.wrap.dataset.cloneSets = String(setsNeeded);
	}

	getCloneMultiplier() {
		return Number(this.wrap.dataset.cloneSets) || 1;
	}

	createAnimation(loopWidth) {
		let rafId = null;
		let position = 0;
		let lastTime = null;

		this.wrap.style.willChange = 'transform';
		this.wrap.style.transform = 'translate3d(0, 0, 0)';

		const tick = (timestamp) => {
			if (lastTime === null) lastTime = timestamp;
			const delta = timestamp - lastTime;
			lastTime = timestamp;

			position = (position + (this.speedPxPerSec * delta) / 1000) % loopWidth;
			this.wrap.style.transform = `translate3d(${-position}px, 0, 0)`;

			rafId = requestAnimationFrame(tick);
		};

		return {
			start: () => {
				if (rafId === null) {
					lastTime = null;
					rafId = requestAnimationFrame(tick);
				}
			},
			stop: () => {
				if (rafId !== null) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
			},
		};
	}

	destroy() {
		if (this.controller) {
			this.controller.stop();
		}
	}
}

/* ------------------------------------------------------------------ */
/* Scroll to top                                                      */
/* ------------------------------------------------------------------ */

class ScrollToTop {
	constructor() {
		this.button = document.querySelector('.site-footer__to-top-btn a');
	}

	init() {
		if (!this.button) return;

		this.button.addEventListener('click', (e) => this.handleClick(e));
	}

	handleClick(e) {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
}

/* ------------------------------------------------------------------ */
/* Burger menu                                                        */
/* ------------------------------------------------------------------ */

class BurgerMenu {
	constructor() {
		this.burgerBtn = document.querySelector('.site-header__burger-btn a');
		this.burgerCloser = document.querySelector('.burger-menu__closer a');
		this.burgerMenu = document.querySelector('.burger-menu');
		this.headerMenuContainer = document.querySelector('.site-header__menu');
		this.headerMenu = this.headerMenuContainer?.querySelector('nav');
		this.burgerMenuInner = this.burgerMenu?.querySelector('.burger-menu__inner');
		this.messengers = document.querySelector('.site-header__messengers');
		this.headerContacts = document.querySelector('.site-header__contacts');
		this.mobileBreakpoint = 1260;
		this.mediaQuery = null;
		this.resizeHandler = null;
	}

	init() {
		if (!this.validateElements()) return;

		this.mediaQuery = window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`);
		this.updateMenuPosition();
		this.setupEventListeners();
	}

	validateElements() {
		return this.burgerBtn && this.burgerCloser && this.burgerMenu &&
		       this.headerMenuContainer && this.headerMenu && this.burgerMenuInner;
	}

	setupEventListeners() {
		this.burgerBtn.addEventListener('click', () => this.openMenu());
		this.burgerCloser.addEventListener('click', () => this.closeMenu());
		document.addEventListener('click', (e) => this.handleOutsideClick(e));

		this.resizeHandler = Utils.debounce(() => this.updateMenuPosition(), 150);
		window.addEventListener('resize', this.resizeHandler);
	}

	isMobileView() {
		return this.mediaQuery.matches || (typeof IsMobile !== 'undefined' && IsMobile);
	}

	openMenu() {
		this.burgerMenu.classList.toggle('opened');
		document.documentElement.classList.add('overflow_hidden');
	}

	closeMenu() {
		this.burgerMenu.classList.remove('opened');
		document.documentElement.classList.remove('overflow_hidden');
	}

	updateMenuPosition() {
		const target = this.isMobileView() ? this.burgerMenuInner : this.headerMenuContainer;
		const target2 = this.isMobileView() ? this.burgerMenuInner : this.headerContacts;

		if (!target.contains(this.headerMenu)) {
			target.appendChild(this.headerMenu);
			target2.appendChild(this.messengers);
		}

		if (!this.isMobileView()) {
			this.closeMenu();
		}
	}

	handleOutsideClick(e) {
		const isOpen = this.burgerMenu.classList.contains('opened');
		const clickedInsideMenu = this.burgerMenuInner.contains(e.target);
		const clickedToggleBtn = this.burgerBtn.contains(e.target);

		if (isOpen && !clickedInsideMenu && !clickedToggleBtn) {
			this.closeMenu();
		}
	}

	destroy() {
		if (this.resizeHandler) {
			window.removeEventListener('resize', this.resizeHandler);
		}
	}
}

/* ------------------------------------------------------------------ */
/* Popup forms                                                        */
/* ------------------------------------------------------------------ */

class PopupForms {
	constructor() {
		this.popupBtns = document.querySelectorAll('.popup-btn');
		this.popupForms = document.querySelectorAll('.popup-form-block');
		this.popupClosers = document.querySelectorAll('.popup-form-block__closer');
	}

	init() {
		if (!this.popupBtns.length) return;

		this.setupEventListeners();
	}

	setupEventListeners() {
		this.popupBtns.forEach(btn => {
			btn.addEventListener('click', (e) => this.handleOpenClick(e, btn));
		});

		this.popupClosers.forEach(btn => {
			btn.addEventListener('click', () => this.closePopup());
		});

		document.addEventListener('click', (e) => this.handleDocumentClick(e));
	}

	handleOpenClick(e, btn) {
		e.preventDefault();
		const popupName = btn.dataset.popup;

		this.closePopup();

		this.popupForms.forEach(form => {
			if (form.dataset.popup === popupName) {
				form.classList.add('opened');
				document.documentElement.classList.add('overflow_hidden');
			}
		});
	}

	handleDocumentClick(e) {
		const openBtn = e.target.closest('.popup-btn');

		if (openBtn) {
			e.preventDefault();
			this.closePopup();

			document
				.querySelector(`.popup-form-block[data-popup="${openBtn.dataset.popup}"]`)
				?.classList.add('opened');

			document.documentElement.classList.add('overflow_hidden');
			return;
		}

		const openedPopup = document.querySelector('.popup-form-block.opened');
		if (!openedPopup) return;

		if (
			e.target.closest('.popup-form-block__closer') ||
			!e.target.closest('.popup-form-block__body')
		) {
			this.closePopup();
		}
	}

	closePopup() {
		this.popupForms.forEach(form => form.classList.remove('opened'));
		document.documentElement.classList.remove('overflow_hidden');
	}
}

/* ------------------------------------------------------------------ */
/* Cookie popup                                                       */
/* ------------------------------------------------------------------ */

class CookiePopup {
	constructor() {
		this.cookieBlock = document.querySelector('.cookie-block');
		this.acceptBtn = document.querySelector('.cookie-block__accept');
	}

	init() {
		if (!this.cookieBlock) return;

		if (!this.getCookie('cookieAccepted')) {
			this.cookieBlock.classList.add('opened');
		}

		if (this.acceptBtn) {
			this.acceptBtn.addEventListener('click', () => this.handleAccept());
		}
	}

	getCookie(name) {
		const matches = document.cookie.match(
			new RegExp(
				"(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
			)
		);

		return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

		document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
	}

	handleAccept() {
		this.cookieBlock.classList.remove('opened');
		this.setCookie('cookieAccepted', '1', 365);
	}
}

/* ------------------------------------------------------------------ */
/* TG button                                                          */
/* ------------------------------------------------------------------ */

class TelegramButton {
	constructor() {
		this.button = document.querySelector('.tg-button-block__closer a');
		this.message = document.querySelector('.tg-button-block__message');
		this.showDelay = 3000;
	}

	init() {
		if (!this.button) return;

		this.button.addEventListener('click', () => this.hideMessage());

		setTimeout(() => {
			this.showMessage();
		}, this.showDelay);
	}

	hideMessage() {
		this.message.classList.add('hidden');
	}

	showMessage() {
		this.message.classList.remove('hidden');
	}
}

/* ------------------------------------------------------------------ */
/* FAQ block                                                          */
/* ------------------------------------------------------------------ */

class FaqBlock {
	constructor() {
		this.faqBlock = document.querySelector('.faq-block');
	}

	init() {
		if (!this.faqBlock) return;

		this.setupEventListeners();
	}

	setupEventListeners() {
		this.faqBlock.querySelectorAll('.faq-block__item').forEach((item) => {
			const title = item.querySelector('.faq-block__item-title');
			title.addEventListener('click', () => this.toggleItem(item));
		});
	}

	toggleItem(item) {
		item.classList.toggle('active');
	}
}

/* ------------------------------------------------------------------ */
/* FAQ block main                                                     */
/* ------------------------------------------------------------------ */

class FaqBlockMain {
	constructor() {
		this.faqBlock = document.querySelector('.faq-block-main');
	}

	init() {
		if (!this.faqBlock) return;

		this.setupEventListeners();
	}

	setupEventListeners() {
		this.faqBlock.querySelectorAll('.faq-block-main__item').forEach((item) => {
			const title = item.querySelector('.faq-block-main__item-title');
			title.addEventListener('click', () => this.toggleItem(item));
		});
	}

	toggleItem(item) {
		item.classList.toggle('active');
	}
}

/* ------------------------------------------------------------------ */
/* Reviews slider (Swiper)                                            */
/* ------------------------------------------------------------------ */

class ReviewsSlider {
	constructor() {
		this.container = document.querySelector('.reviews-block__list .swiper');
		this.swiper = null;
	}

	init() {
		if (!this.container || typeof Swiper === 'undefined') return;

		this.swiper = new Swiper(this.container, {
			slidesPerView: 3,
			spaceBetween: 12,
			loop: false,
			watchSlidesVisibility: true,
			watchSlidesProgress: true,
			lazy: {
				loadPrevNext: true,
				loadPrevNextAmount: 2,
			},
			navigation: {
				nextEl: '.reviews-block__controls .swiper-button-next',
				prevEl: '.reviews-block__controls .swiper-button-prev',
			},
			pagination: {
				el: '.reviews-block__pagination.swiper-pagination',
				clickable: true,
			},
			breakpoints: {
				0: { slidesPerView: 1 },
				640: { slidesPerView: 2 },
				980: { slidesPerView: 3 }
			},
		});
	}

	destroy() {
		if (this.swiper) {
			this.swiper.destroy();
		}
	}
}

/* ------------------------------------------------------------------ */
/* Animations                                                         */
/* ------------------------------------------------------------------ */

class SiteAnimations {
	constructor() {
		this.animatedItems = null;
		this.wordElements = null;
	}

	init() {
		if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

		gsap.registerPlugin(ScrollTrigger);

		this.animateItems();
		this.animateWords();
	}

	animateItems() {
		const items = document.querySelectorAll(
			'.portfolio-block__item, .services-block__item, .advantages-block__item, ' +
			'.work-steps__item, .faq-block-main__item, .form-block__left, .form-block__right, ' +
			'.feature-block__item, .faq-block__item, .reviews-block__item, .about-advantages__item' + 
			'.for-clients-block__item, .work-steps-numb__item'
		);

		const groups = new Map();

		items.forEach((item) => {
			const parent = item.parentElement;
			if (!groups.has(parent)) {
				groups.set(parent, []);
			}
			groups.get(parent).push(item);
		});

		const isMobile = window.innerWidth <= 768;

		groups.forEach((groupItems) => {
			groupItems.forEach((item, index) => {
				gsap.fromTo(item,
					{
						opacity: 0,
						y: 30
					},
					{
						opacity: 1,
						y: 0,
						scrollTrigger: {
							trigger: item.parentElement,
							start: isMobile ? "top 110%" : "top 90%",
						},
						duration: 1,
						delay: index * 0.30
					}
				);
			});
		});
	}

	animateWords() {
		const wordElements = document.querySelectorAll(".block-title");

		wordElements.forEach((item) => {
			const text = item.textContent;
			item.innerHTML = "";

			text.split(" ").forEach(word => {
				const wordSpan = document.createElement("span");
				wordSpan.classList.add("word");

				word.split("").forEach(letter => {
					const letterSpan = document.createElement("span");
					letterSpan.textContent = letter;
					wordSpan.appendChild(letterSpan);
				});

				item.appendChild(wordSpan);
				item.appendChild(document.createTextNode(" "));
			});

			const letterSpans = item.querySelectorAll(".word span");

			gsap.fromTo(letterSpans, {
				opacity: 0,
				y: 20,
			}, {
				duration: 1,
				opacity: 1,
				y: 0,
				stagger: 0.05,
				ease: "power1.out",
				scrollTrigger: {
					trigger: item,
					start: 'top 80%',
					end: 'bottom 20%',
					toggleActions: 'play',
				}
			});
		});
	}

	destroy() {
		if (typeof ScrollTrigger !== 'undefined') {
			ScrollTrigger.getAll().forEach(trigger => trigger.kill());
		}
	}
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

class Utils {
	static debounce(fn, delay) {
		let timeoutId;
		return (...args) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), delay);
		};
	}
}

/* ------------------------------------------------------------------ */
/* Initialize application                                             */
/* ------------------------------------------------------------------ */

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
