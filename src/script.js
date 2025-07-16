// Enhanced JavaScript functionality for the portfolio

class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupFormHandling();
        this.setupAnimations();
        this.setupTypingEffect();
        this.setupThemeToggle();
        this.setupParticleEffect();
        this.setupInteractiveSkills();
    }

    // Mobile menu functionality
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                this.toggleMobileMenuIcon();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    this.resetMobileMenuIcon();
                }
            });
        }
    }

    toggleMobileMenuIcon() {
        const icon = document.querySelector('#mobile-menu-btn i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    }

    resetMobileMenuIcon() {
        const icon = document.querySelector('#mobile-menu-btn i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    }

    // Smooth scrolling for navigation
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                        this.resetMobileMenuIcon();
                    }
                }
            });
        });
    }

    // Scroll effects for navigation and animations
    setupScrollEffects() {
        let ticking = false;

        const updateOnScroll = () => {
            this.updateNavigation();
            this.updateActiveSection();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        });
    }

    updateNavigation() {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('bg-gray-900', 'shadow-lg');
                nav.classList.remove('bg-gray-900/90');
            } else {
                nav.classList.add('bg-gray-900/90');
                nav.classList.remove('bg-gray-900', 'shadow-lg');
            }
        }
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY <= sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('text-blue-400');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-blue-400');
            }
        });
    }

    // Form handling with validation
    setupFormHandling() {
        const form = document.querySelector('#contact form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'text':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'This field must be at least 2 characters long';
                }
                break;
            default:
                if (field.tagName === 'TEXTAREA' && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                }
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('border-red-500');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-400 text-sm mt-1';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        } else {
            field.classList.remove('border-red-500');
            field.classList.add('border-green-500');
        }
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500', 'border-green-500');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    handleFormSubmission(form) {
        const inputs = form.querySelectorAll('input, textarea');
        let allValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                allValid = false;
            }
        });

        if (allValid) {
            this.showSuccessMessage();
            form.reset();
            inputs.forEach(input => {
                this.clearFieldError(input);
            });
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        message.innerHTML = '<i class="fas fa-check mr-2"></i>Message sent successfully!';
        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            message.classList.add('translate-x-full');
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 3000);
    }

    // Intersection Observer for animations
    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-slide-up');
                    }, index * 100);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });

        // Progress bars animation
        const progressBars = document.querySelectorAll('.progress-bar');
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 200);
                }
            });
        });

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });
    }

    // Typing effect for hero section
    setupTypingEffect() {
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            const text = typingElement.textContent;
            typingElement.textContent = '';
            typingElement.style.display = 'inline-block';

            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    typingElement.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };

            setTimeout(typeWriter, 1000);
        }
    }

    // Theme toggle functionality
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                this.updateThemeIcon();
            });
        }
    }

    updateThemeIcon() {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        }
    }

    // Simple particle effect for hero section
    setupParticleEffect() {
        const hero = document.getElementById('home');
        if (hero) {
            this.createParticles(hero);
        }
    }

    createParticles(container) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                pointer-events: none;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(particle);
        }
    }

    // Interactive Skills Section
    setupInteractiveSkills() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        if (skillCards.length === 0) return;

        // Add click event listeners to each skill card
        skillCards.forEach(card => {
            card.addEventListener('click', () => {
                this.activateSkillCard(card);
            });

            // Add keyboard support
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.activateSkillCard(card);
                }
            });
        });

        // Add keyboard navigation (arrow keys)
        this.setupSkillsKeyboardNavigation(skillCards);
    }

    activateSkillCard(targetCard) {
        const allCards = document.querySelectorAll('.skill-card');
        
        // Prevent multiple rapid clicks
        // if (targetCard.classList.contains('transitioning')) return;
        // if (targetCard.classList.contains('active')) return;
        
        // Mark all cards as transitioning
        allCards.forEach(card => {
            card.classList.add('transitioning');
            card.classList.remove('animate-progress');
        });

        // Reset all progress bars immediately
        this.resetAllProgressBars();
        
        // Remove active class from all cards
        allCards.forEach(card => {
            card.classList.remove('active');
        });

        // Activate the target card
        targetCard.classList.add('active');
        
        // Wait for CSS transition to complete, then animate progress bars
        setTimeout(() => {
            this.animateProgressBars(targetCard);
            
            // Remove transitioning state
            allCards.forEach(card => {
                card.classList.remove('transitioning');
            });
        }, 200);
    }

    resetAllProgressBars() {
        const allProgressBars = document.querySelectorAll('.progress-bar');
        allProgressBars.forEach(bar => {
            // Store original width as CSS custom property
            const originalWidth = bar.style.width;
            bar.style.setProperty('--target-width', originalWidth);
            bar.style.width = '0%';
        });
    }

    animateProgressBars(card) {
        const progressBars = card.querySelectorAll('.progress-bar');
        
        // Add animation class to trigger staggered animations
        setTimeout(() => {
            card.classList.add('animate-progress');
            
            // Set individual widths with CSS custom properties
            progressBars.forEach((bar, index) => {
                const targetWidth = bar.getAttribute('data-width') || bar.style.getPropertyValue('--target-width');
                if (targetWidth) {
                    bar.style.setProperty('--target-width', targetWidth);
                    setTimeout(() => {
                        bar.style.width = targetWidth;
                    }, index * 100);
                }
            });
        }, 100);
    }

    scrollToActiveCard(card) {
        // Only scroll on mobile or if card is not fully visible
        if (window.innerWidth <= 768) {
            card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    setupSkillsKeyboardNavigation(cards) {
        let currentIndex = 0;
        
        // Find currently active card
        cards.forEach((card, index) => {
            if (card.classList.contains('active')) {
                currentIndex = index;
            }
        });

        document.addEventListener('keydown', (e) => {
            // Only handle arrow keys when focus is on a skill card
            const focusedElement = document.activeElement;
            if (!focusedElement.classList.contains('skill-card')) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    currentIndex = Math.max(0, currentIndex - 1);
                    this.focusSkillCard(cards, currentIndex);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    currentIndex = Math.min(cards.length - 1, currentIndex + 1);
                    this.focusSkillCard(cards, currentIndex);
                    break;
            }
        });
    }

    focusSkillCard(cards, index) {
        cards[index].focus();
        this.activateSkillCard(cards[index]);
    }

    // Auto-cycle through skills (optional feature)
    startSkillsAutoCycle() {
        const cards = document.querySelectorAll('.skill-card');
        let currentIndex = 0;
        
        const cycle = () => {
            currentIndex = (currentIndex + 1) % cards.length;
            this.activateSkillCard(cards[currentIndex]);
        };

        // Auto-cycle every 5 seconds, but pause on hover
        let intervalId = setInterval(cycle, 5000);
        
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer) {
            skillsContainer.addEventListener('mouseenter', () => {
                clearInterval(intervalId);
            });
            
            skillsContainer.addEventListener('mouseleave', () => {
                intervalId = setInterval(cycle, 5000);
            });
        }
    }

    // Utility method for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Method to handle window resize
    handleResize() {
        // Recalculate any size-dependent features
        this.debounce(() => {
            // Add resize logic here if needed
        }, 250)();
    }
}

// Initialize the portfolio app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when tab becomes visible
        document.body.style.animationPlayState = 'running';
    }
});

// Preload images for better performance
const preloadImages = () => {
    const images = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Start preloading images
preloadImages();
