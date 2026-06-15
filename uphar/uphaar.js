document.addEventListener('DOMContentLoaded', function () {
    initScrollEffects();
    initTierSelection();
    initSmoothScrolling();
    initFaqAccordion();
    initHamburger();
    initBackToTop();
    initScrollAnimations();
    initContactButtons();
});

function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

function initTierSelection() {
    const tierCards = document.querySelectorAll('.tier-card');

    tierCards.forEach(function (card) {
        card.addEventListener('click', function () {
            tierCards.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile menu if open
            const nav = document.querySelector('.sticky-header nav');
            const hamburger = document.getElementById('hamburger');
            if (nav) nav.classList.remove('open');
            if (hamburger) hamburger.classList.remove('open');
        });
    });

    const rewardBtn = document.querySelector('.primary-btn');
    if (rewardBtn) {
        rewardBtn.addEventListener('click', function () {
            const section = document.getElementById('reward-tiers');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const downloadBtn = document.querySelector('.hero-buttons .secondary-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            // Replace 'brochure.pdf' with the actual path when available
            // window.open('brochure.pdf', '_blank');
            alert('Brochure coming soon! Contact us at approval@fairfordpharma.com');
        });
    }
}

function initFaqAccordion() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
        const heading = item.querySelector('h3');
        if (!heading) return;

        heading.addEventListener('click', function () {
            const isOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.faq-item').forEach(function (i) {
                i.classList.remove('open');
            });
            // Re-open if it was closed
            if (!isOpen) item.classList.add('open');
        });
    });
}

function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.querySelector('.sticky-header nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
            nav.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step-card, .product-card').forEach(function (el) {
        observer.observe(el);
    });
}

function initContactButtons() {
    document.querySelectorAll('.cta-primary').forEach(function (btn) {
        if (btn.textContent.includes('Call Us')) {
            btn.addEventListener('click', function () {
                window.location.href = 'tel:8287126438';
            });
        }
    });

    document.querySelectorAll('.cta-secondary').forEach(function (btn) {
        if (btn.textContent.includes('Email')) {
            btn.addEventListener('click', function () {
                window.location.href = 'mailto:approval@fairfordpharma.com';
            });
        }
    });
}