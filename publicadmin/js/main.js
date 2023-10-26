jQuery(function () {
    jQuery(".hamburger").click(function () {
        jQuery('.menuTitle').not('.noL2').each(function () {
            jQuery(this).attr('data-href', jQuery(this).attr('href'));
        });
        jQuery('.menuTitle').not('.noL2').removeAttr('href');
        if (jQuery(this).hasClass('is-active')) {
            jQuery('.menuTitle, .title').removeClass('active');
            jQuery('.menuTitle, .menu20 li').show();
        }
        jQuery(this).toggleClass("is-active");
        jQuery('.menu20').toggleClass("is-active");
        jQuery("#profileContainer").hide();
    });
});


jQuery(".menu20 .menuTitle").not('.noL2').click(function (e) {
    if (jQuery(window).width() < 992) {
        jQuery('.menuTitle').not('.noL2').removeAttr('href');
        let m20c = jQuery(this).next('.menu20Content');
        jQuery(".menuTitle").not(this).parent().toggle();
        m20c.toggle();
        jQuery(this).toggleClass('active');
        jQuery('#header20 .menu20 .menu20Content .title').addClass('hidd');


    }
});
jQuery('.menuTitle').hover(function (e) {
    el = jQuery(this).next('.menu20Content').children('div').children('div').children('div').children('ul').children('li:nth-child(1)');
    el2 = jQuery(this).next('.menu20Content').children('div').children('div').children('div').children('ul').children('li:nth-child(1)').children('.title');
    el.addClass('hovered');
    el2.addClass('hovered');
});
jQuery('.title').hover(function (e) {
    jQuery('li,.title').removeClass('hovered');
});
jQuery('.menu20Content .content').hover(function (e) {
    jQuery(e.currentTarget).prev('.title').toggleClass("hovered");
});

jQuery('.menu20Content').hover(function (e) {
    jQuery(e.currentTarget).prev('.menuTitle').toggleClass("hovered");
});

jQuery(window).resize(function () {
    jQuery("#profileContainer").hide();
    if (jQuery(window).width() < 992) {
    } else {
        /* jQuery('.active').removeClass('active'); */
        jQuery('.is-active').removeClass('is-active');
        jQuery('.hovered').removeClass('hovered');

        jQuery('.menuTitle').not('.noL2').each(function () {
            jQuery(this).attr('href', jQuery(this).data('href'));
        });
        jQuery('.menu20Content').removeAttr('style');
    }
});
// -----------------wishlist dropdown--------------------
function myFunction() {
    document.getElementById("mywishDropdown").classList.toggle("show");
}
window.onclick = function (event) {
    if (!event.target.matches('.wishdropbtn')) {
        var dropdowns = document.getElementsByClassName("wishdropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// -------------------------Main Slider------------------------
const slides = document.querySelectorAll('.slide');
const controls = document.querySelectorAll('.control');
let activeSlide = 0;
let prevActive = 0;

changeSlides();
let int = setInterval(changeSlides, 4000);

function changeSlides() {
    slides[prevActive].classList.remove('active');
    controls[prevActive].classList.remove('active');

    slides[activeSlide].classList.add('active');
    controls[activeSlide].classList.add('active');

    prevActive = activeSlide++;

    if (activeSlide >= slides.length) {
        activeSlide = 0;
    }

    // console.log(prevActive, activeSlide);
}

controls.forEach(control => {
    control.addEventListener('click', () => {
        let idx = [...controls].findIndex(c => c === control);
        activeSlide = idx;

        changeSlides();

        clearInterval(int);
        int = setInterval(changeSlides, 4000);
    });
});
// ------------------------Explore Careers------------------------
const tabsBox = document.querySelector(".tabs-box"),
    allTabs = tabsBox.querySelectorAll(".tab"),
    arrowIcons = document.querySelectorAll(".icon i");

let isDragging = false;

const handleIcons = (scrollVal) => {
    let maxScrollableWidth = tabsBox.scrollWidth - tabsBox.clientWidth;
    arrowIcons[0].parentElement.style.display = scrollVal <= 0 ? "none" : "flex";
    arrowIcons[1].parentElement.style.display =
        maxScrollableWidth - scrollVal <= 1 ? "none" : "flex";
};

arrowIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
        // if clicked icon is left, reduce 350 from tabsBox scrollLeft else add
        let scrollWidth = (tabsBox.scrollLeft += icon.id === "left" ? -340 : 340);
        handleIcons(scrollWidth);
    });
});

allTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabsBox.querySelector(".active").classList.remove("active");
        tab.classList.add("active");
    });
});

const dragging = (e) => {
    if (!isDragging) return;
    tabsBox.classList.add("dragging");
    tabsBox.scrollLeft -= e.movementX;
    handleIcons(tabsBox.scrollLeft);
};

const dragStop = () => {
    isDragging = false;
    tabsBox.classList.remove("dragging");
};

tabsBox.addEventListener("mousedown", () => (isDragging = true));
tabsBox.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);

/* ------------------------ Watermark (Please Ignore) ----------------------- */
const createSVG = (width, height, className, childType, childAttributes) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    const child = document.createElementNS(
        "http://www.w3.org/2000/svg",
        childType
    );

    for (const attr in childAttributes) {
        child.setAttribute(attr, childAttributes[attr]);
    }

    svg.appendChild(child);

    return { svg, child };
};

document.querySelectorAll(".generate-button").forEach((button) => {
    const width = button.offsetWidth;
    const height = button.offsetHeight;

    const style = getComputedStyle(button);

    const strokeGroup = document.createElement("div");
    strokeGroup.classList.add("stroke");

    const { svg: stroke } = createSVG(width, height, "stroke-line", "rect", {
        x: "0",
        y: "0",
        width: "100%",
        height: "100%",
        rx: parseInt(style.borderRadius, 10),
        ry: parseInt(style.borderRadius, 10),
        pathLength: "30"
    });

    strokeGroup.appendChild(stroke);
    button.appendChild(strokeGroup);

    const stars = gsap.to(button, {
        repeat: -1,
        repeatDelay: 0.5,
        paused: true,
        keyframes: [
            {
                "--generate-button-star-2-scale": ".5",
                "--generate-button-star-2-opacity": ".25",
                "--generate-button-star-3-scale": "1.25",
                "--generate-button-star-3-opacity": "1",
                duration: 0.3
            },
            {
                "--generate-button-star-1-scale": "1.5",
                "--generate-button-star-1-opacity": ".5",
                "--generate-button-star-2-scale": ".5",
                "--generate-button-star-3-scale": "1",
                "--generate-button-star-3-opacity": ".5",
                duration: 0.3
            },
            {
                "--generate-button-star-1-scale": "1",
                "--generate-button-star-1-opacity": ".25",
                "--generate-button-star-2-scale": "1.15",
                "--generate-button-star-2-opacity": "1",
                duration: 0.3
            },
            {
                "--generate-button-star-2-scale": "1",
                duration: 0.35
            }
        ]
    });

    button.addEventListener("pointerenter", () => {
        gsap.to(button, {
            "--generate-button-dots-opacity": "1",
            duration: 0.5,
            onStart: () => {
                setTimeout(() => stars.restart().play(), 500);
            }
        });
    });

    button.addEventListener("pointerleave", () => {
        gsap.to(button, {
            "--generate-button-dots-opacity": "0",
            "--generate-button-star-1-opacity": ".25",
            "--generate-button-star-1-scale": "1",
            "--generate-button-star-2-opacity": "1",
            "--generate-button-star-2-scale": "1",
            "--generate-button-star-3-opacity": ".5",
            "--generate-button-star-3-scale": "1",
            duration: 0.15,
            onComplete: () => {
                stars.pause();
            }
        });
    });
});

// ---------------------Goal Slider--------------------------------
$(document).ready(function () {
    $('.PartnersSlider').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        dots: false,
        prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
        nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>",
        pauseOnHover: false,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 520,
            settings: {
                slidesToShow: 2
            }
        }]
    });
});