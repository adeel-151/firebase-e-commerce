// js/animations.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis (Smooth Scrolling)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time)=>{
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);
    }

    // 2. Preloader & Curtain Drop Effect
    const preloader = document.querySelector('.preloader');
    if (preloader && typeof gsap !== 'undefined') {
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
        lenis.stop();

        const tl = gsap.timeline();
        
        // Simulate loading progress
        let progress = { value: 0 };
        const percentText = document.querySelector('.preloader-percentage');
        
        tl.to(progress, {
            value: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
                if(percentText) percentText.textContent = `${Math.round(progress.value)}%`;
                gsap.set('.preloader-bar', { width: `${progress.value}%` });
            }
        })
        .to('.preloader-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.5")
        .to('.preloader-content', {
            opacity: 0,
            duration: 0.5,
            delay: 0.2
        })
        .to(preloader, {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                document.body.style.overflow = '';
                lenis.start();
                // Trigger hero animations here if desired
                gsap.from('.hero-caption h1', { y: 50, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.2 });
                gsap.from('.hero-caption p', { y: 20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });
                gsap.from('.hero-caption .btn', { y: 20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
            }
        });
    }

    // 3. Custom Cursor & Magnetic Elements
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        // Hide default cursor only if custom cursor is active (prevents admin panel bug)
        document.body.style.cursor = 'none';
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let outlineX = mouseX;
        let outlineY = mouseY;

        // Track Mouse
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the dot
            gsap.set(cursorDot, {
                x: mouseX,
                y: mouseY
            });
        });

        // Smooth trailing for the outline
        gsap.ticker.add(() => {
            // Lerp (Linear Interpolation) for smooth trailing
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            
            gsap.set(cursorOutline, {
                x: outlineX,
                y: outlineY
            });
        });

        // Hover Effects (Buttons, Links)
        const hoverables = document.querySelectorAll('a, button, .magnetic, .btn');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover-active');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover-active');
                // Reset magnetic translation
                if(el.classList.contains('magnetic') || el.classList.contains('btn')){
                    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                }
            });

            // Magnetic Effect Logic
            if(el.classList.contains('magnetic') || el.classList.contains('btn')) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    gsap.to(el, {
                        x: x * 0.3, // Strength of pull
                        y: y * 0.3,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                });
            }
        });
    }

    // 4. ScrollTrigger Animations (Cascading Grid Reveal)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        
        // Reveal elements smoothly as they enter viewport
        const revealElements = document.querySelectorAll('.reveal-up');
        revealElements.forEach((el, index) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // when top of element hits 85% of viewport
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        // Category Cards Staggered Reveal
        const categories = document.querySelectorAll('.category-grid-img');
        if (categories.length > 0) {
            gsap.from(categories, {
                scrollTrigger: {
                    trigger: ".category-grid-img",
                    start: "top 80%"
                },
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2, // Cascading effect
                ease: "power3.out"
            });
        }
    }
});
