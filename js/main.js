document.addEventListener('DOMContentLoaded', () => {

    // 0. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.08, // Buttery smooth easing
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 0.05 Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // 0.1 Custom Cursor Logic
    const cursorDot = document.getElementById("cursor-dot");

    // Only activate custom cursor on fine pointer devices (desktops)
    if (cursorDot && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("mousemove", (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        });

        // Add hovering expansion & tilt effects
        const interactables = document.querySelectorAll("a, button, input, textarea, .card, .training-card, .price-card, .faq-btn, .service-category, .approach-card");
        interactables.forEach(el => {
            el.addEventListener("mouseenter", () => {
                cursorDot.style.transform = "translate(-50%, -50%) scale(1.3) rotate(-15deg)";
                cursorDot.style.color = "var(--clr-gold)";
            });
            el.addEventListener("mouseleave", () => {
                cursorDot.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
                cursorDot.style.color = "var(--clr-navy-light)";
            });
        });
    }

    // 1. Sticky Navbar
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            }
        });
    });

    // 3. Active Nav Link on Scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    });

    // 4. Smooth Scroll for offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Adjust for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once faded in
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 6. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-btn');
        btn.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-content').style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            const content = item.querySelector('.faq-content');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 7. Scroll-Controlled Video Playback
    const video = document.getElementById('scroll-video');
    const heroSection = document.getElementById('home');

    if (video && heroSection) {
        // Enforce pausing immediately and continuously
        video.pause();
        video.currentTime = 0;
        
        // Prevent any unintended playback
        video.addEventListener('play', () => {
            video.pause();
        });

        let targetTime = 0;
        let currentTime = 0;

        function updateVideoLoop() {
            const heroRect = heroSection.getBoundingClientRect();
            const heroHeight = heroRect.height;
            const windowHeight = window.innerHeight;
            // Total distance available to scroll within the hero track
            const scrollRange = heroHeight - windowHeight;
            
            if (scrollRange > 0) {
                // If heroRect.top is 0, we are at the top. As we scroll, it goes negative.
                const scrollPos = -heroRect.top;
                let progress = scrollPos / scrollRange;
                
                // Clamp progress to restrict scrubbing to the container natively
                progress = Math.max(0, Math.min(1, progress));
                
                if (video.duration) {
                    targetTime = progress * (video.duration - 0.1); // slight buffer to avoid looping logic issues
                }

                // Fade out scroll indicator as user scrolls down
                const scrollPrompt = document.getElementById('scroll-prompt');
                if (scrollPrompt) {
                    // Fade out completely by around 15% scroll progress
                    scrollPrompt.style.opacity = Math.max(0, 0.8 - (progress * 5));
                }

                // Parallax text effect: push text down and fade out slightly as it scrolls
                const heroContent = heroSection.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${progress * 100}px) scale(${1 - progress * 0.05})`;
                    heroContent.style.opacity = Math.max(0, 1 - Math.pow(progress, 2));
                }
            }

            // Lerp the video time for a buttery smooth scrub effect
            // Increasing this factor (from 0.08 to 0.15) for higher responsiveness (pseudo-higher FPS feel)
            currentTime += (targetTime - currentTime) * 0.15;
            
            // Apply to video if the metadata is loaded
            if (video.readyState >= 1 && video.duration) {
                // Ensure it remains paused in case the browser tried to resume it
                if (!video.paused) video.pause();
                
                // Lowering the threshold (from 0.05 to 0.01) for much finer frame updates
                if (!video.seeking && Math.abs(video.currentTime - currentTime) > 0.01) {
                    video.currentTime = currentTime;
                }
            }

            requestAnimationFrame(updateVideoLoop);
        }

        video.addEventListener('loadedmetadata', () => {
            requestAnimationFrame(updateVideoLoop);
        });
        
        if (video.readyState >= 1) {
            requestAnimationFrame(updateVideoLoop);
        }
    }

    // 8. GSAP Timeline Animations
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((step, i) => {
        const content = step.querySelector('.step-content');
        const point = step.querySelector('.step-point');
        
        gsap.fromTo(content, 
            { opacity: 0, x: i % 2 === 0 ? 50 : -50 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1,
                scrollTrigger: {
                    trigger: step,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        gsap.fromTo(point,
            { scale: 0 },
            {
                scale: 1,
                duration: 0.5,
                scrollTrigger: {
                    trigger: step,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Animate Services and Approach
    gsap.fromTo('.service-category',
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.services-grid-new',
                start: "top 85%"
            }
        }
    );

    gsap.fromTo('.approach-card',
        { opacity: 0, scale: 0.9 },
        {
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            duration: 0.7,
            scrollTrigger: {
                trigger: '.approach-grid',
                start: "top 85%"
            }
        }
    );

    // Final ScrollTrigger refresh to ensure correct positioning with Lenis
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
    
    // Refresh after a slight delay for lazy-loaded content
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 1000);
});
