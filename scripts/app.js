document.addEventListener('DOMContentLoaded', function(){
    const servicesSlider = new Swiper ('.services-block__list .swiper', {
        slidesPerView: 4,
        spaceBetween: 12,
        loop: false,
        freeMode: true,
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
                slidesPerView: 4,
            }
        }
    });
})