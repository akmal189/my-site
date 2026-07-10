document.addEventListener('DOMContentLoaded', function(){
    const lenis = new Lenis({
        // параметры настройки
        lerp: 0.08, // коэффициент сглаживания (0 - 1)
        smooth: true, // включить плавный скролл
        direction: 'vertical', // направление скролла (vertical or horizontal)
        smoothWheel: true, // плавный скролл колесом мыши
        smoothTouch: false, // плавный скролл при касании (mobile)
        infinite: false // бесконечный скролл
    })

    window.addEventListener('load', () => {
		// запуск анимации скролла
		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		requestAnimationFrame(() => {
			let height = document.body.scrollHeight;
			document.body.style.height = height + 'px';
		});
	})

    const servicesSlider = new Swiper ('.services-block__list .swiper', {
        slidesPerView: 4,
        spaceBetween: 12,
        loop: false,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        lazy: {
            loadPrevNext: true, // pre-loads the next image to avoid showing a loading placeholder if possible
            loadPrevNextAmount: 2 //or, if you wish, preload the next 2 images
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
            0: {
                slidesPerView: 1,
            },
            640: {
                slidesPerView: 2,
            },
            980: {
                slidesPerView: 3,
            },
            1100: {
                slidesPerView: 4,
            }
        }
    });

    function tickerBlock() {
        const wrap = document.querySelector('.ticker-block__inner');
        const ticker = document.querySelector('.ticker-block');
        const originalItems = Array.from(wrap.children);

        const originalWidth = wrap.scrollWidth; // ширина одного набора
        const tickerWidth = ticker.offsetWidth;

        // сколько наборов нужно, чтобы покрыть 2x ширины контейнера + запас
        const setsNeeded = Math.max(2, Math.ceil((tickerWidth * 2) / originalWidth) + 1);

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < setsNeeded - 1; i++) {
            originalItems.forEach(el => fragment.appendChild(el.cloneNode(true)));
        }
        wrap.appendChild(fragment); // один reflow вместо множества

        const width = originalWidth; // ширина одного цикла для зацикливания

        let rafId = null;
        let position = 0;
        let lastTime = null;
        const speedPxPerSec = 58;

        wrap.style.willChange = 'transform';
        wrap.style.transform = 'translate3d(0, 0, 0)';

        function animate(timestamp) {
            if (lastTime === null) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            position += (speedPxPerSec * delta) / 1000;
            if (position >= width) position -= width;

            wrap.style.transform = `translate3d(${-position}px, 0, 0)`;
            rafId = requestAnimationFrame(animate);
        }

        function start() {
            if (rafId === null) {
                lastTime = null;
                rafId = requestAnimationFrame(animate);
            }
        }

        function stop() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        ticker.addEventListener('mouseenter', stop);
        ticker.addEventListener('mouseleave', start);

        start();
    }

    if(document.querySelector('.ticker-block')) {
        tickerBlock();
    }

    const toTopBtn = document.querySelector('.site-footer__to-top-btn a');

    if(toTopBtn) {
        toTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        })
    }

    const burgerBtn = document.querySelector('.site-header__burger-btn a');
    const burgerCloser = document.querySelector('.burger-menu__closer a');
    const burgerMenu = document.querySelector('.burger-menu');
    const headerMenu = document.querySelector('.site-header__menu nav');
    const burgerMenuInner = burgerMenu.querySelector('.burger-menu__inner');

    function isMobileView() {
        return window.innerWidth <= 1260 || (typeof IsMobile !== 'undefined' && IsMobile);
    }

    function updateMenuPosition() {
        if (isMobileView()) {
            if (!burgerMenuInner.contains(headerMenu)) {
                burgerMenuInner.appendChild(headerMenu);
            }
        } else {
            const headerContainer = document.querySelector('.site-header__menu');
            if (!headerContainer.contains(headerMenu)) {
                headerContainer.appendChild(headerMenu);
            }
            burgerMenu.classList.remove('opened');
            document.querySelector('html').classList.remove('overflow_hidden');
        }
    }

    updateMenuPosition();

    burgerBtn.addEventListener('click', (e) => {
        burgerMenu.classList.toggle('opened');
    });

    burgerCloser.addEventListener('click', (e) => {
        burgerMenu.classList.remove('opened');
    });

    document.addEventListener('click', (e) => {
        if (burgerMenu.classList.contains('opened') &&
            !burgerMenuInner.contains(e.target) &&
            e.target !== burgerBtn) {
            burgerMenu.classList.remove('opened');
        }
    });

    window.addEventListener('resize', updateMenuPosition);
})