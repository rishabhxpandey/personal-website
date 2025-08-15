// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Starfield parallax scroll effect
let ticking = false;
let lastScrollTop = 0;
let scrollVelocity = 0;

function updateStarfield() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrolled / maxScroll;
    
    // Calculate scroll velocity for motion blur effect
    scrollVelocity = Math.abs(scrolled - lastScrollTop);
    lastScrollTop = scrolled;
    
    // Add/remove fast scrolling class for motion blur
    if (scrollVelocity > 20) {
        document.body.classList.add('scrolling-fast');
        setTimeout(() => {
            document.body.classList.remove('scrolling-fast');
        }, 150);
    }
    
    // Speed up animations based on scroll velocity
    const speedMultiplier = 1 + (scrollVelocity / 100);
    
    // Update animation speed based on scroll
    document.documentElement.style.setProperty('--animation-speed', speedMultiplier);
    
    // Create scroll-based parallax effect that enhances the animations
    const foregroundOffset = scrolled * 0.5;
    const backgroundOffset = scrolled * 0.2;
    
    document.documentElement.style.setProperty('--scroll-offset-fast', foregroundOffset + 'px');
    document.documentElement.style.setProperty('--scroll-offset-slow', backgroundOffset + 'px');
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateStarfield);
        ticking = true;
    }
}

// Update active nav link on scroll and starfield effect
window.addEventListener('scroll', () => {
    // Navigation update
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
    
    // Starfield parallax effect
    requestTick();
});

// Enhanced starfield effect on mouse movement for extra immersion
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    // Subtle mouse-based parallax effect
    document.documentElement.style.setProperty('--mouse-x', (mouseX - 0.5) * 20 + 'px');
    document.documentElement.style.setProperty('--mouse-y', (mouseY - 0.5) * 20 + 'px');
});

// Project Carousel Functionality
class ProjectCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.project-card');
        this.totalSlides = this.slides.length;
        this.track = document.querySelector('.projects-track');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.dots = document.querySelectorAll('.carousel-dot');
        
        // Ensure we have the required elements
        if (!this.track || !this.prevBtn || !this.nextBtn) {
            console.error('Carousel elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Add dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Add touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            // Prevent default scroll behavior when swiping horizontally
            if (Math.abs(diff) > 10) {
                e.preventDefault();
            }
        });
        
        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = startX - currentX;
            
            // Minimum swipe distance threshold
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
        
        // Initialize carousel
        this.updateCarousel();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    updateCarousel() {
        // Move the track - each slide is 33.333% of track width
        const translateX = -this.currentSlide * 33.333;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update active states
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        // Enable infinite scrolling by not disabling buttons
        this.prevBtn.disabled = false;
        this.nextBtn.disabled = false;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new ProjectCarousel();
});
