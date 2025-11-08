// Smooth animations on load
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const badges = document.querySelectorAll('.badge');
    
    // Fade in card
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);

    // Animate badges sequentially
    badges.forEach((badge, index) => {
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            badge.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            badge.style.opacity = '1';
            badge.style.transform = 'scale(1)';
        }, 400 + (index * 30));
    });

    // Animate project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 600 + (index * 150));
    });

    // Modal functionality
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.querySelector('.modal-close');

    // Add click event to project cards
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.project-img');
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            
            modal.classList.add('show');
            modalImg.src = img.src;
            modalCaption.textContent = `${title} - ${description}`;
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal on X click
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
});
