let favorites = [];
let swiperInstance = null;

function toggleDropdown() {
    const content = document.getElementById('favorites-content');
    const icon = document.getElementById('dropdown-icon');
    content.classList.toggle('is-open');
    icon.classList.toggle('rotate-180');
}

function updateUI() {
    const wrapper = document.getElementById('favorites-wrapper');
    const count = document.getElementById('fav-count');
    const swiperEl = document.querySelector('.mySwiper');
    const emptyState = document.getElementById('empty-state');
    

    count.innerText = favorites.length;
    
    if (favorites.length > 0) {
        // Show Swiper, hide empty state
        emptyState.classList.add('hidden');
        swiperEl.classList.remove('swiper-hidden');

        console.log(favorites)
        
        wrapper.innerHTML = favorites.map(fav => `
            <div class="swiper-slide">
                <div class="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg border border-gray-100" data-link="${fav.link}">
                    <img src="${fav.img}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 md:p-4">
                        <span class="text-white text-lg md:text-sm font-bold truncate font-gog">${fav.title}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Refresh Swiper
        if (swiperInstance) swiperInstance.destroy(true, true);
        swiperInstance = new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 15,
            pagination: { el: ".swiper-pagination", dynamicBullets: true, clickable: true },
            breakpoints: {
                640: { slidesPerView: 3.2 },
                1024: { slidesPerView: 5.2 },
            },
        });
    } else {
        // Reclaim space completely when 0 favorites
        emptyState.classList.remove('hidden');
        swiperEl.classList.add('swiper-hidden');
        wrapper.innerHTML = ""; 
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
    }
}

function toggleFavorite(btn) {
    const card = btn.closest('[data-id]');
    const id = card.getAttribute('data-id');
    const title = card.querySelector('h3').innerText;
    const img = card.querySelector('img').src;
    const link = card.dataset.link;

    btn.classList.toggle('is-favorite');

    if (btn.classList.contains('is-favorite')) {
        favorites.push({ id, title, img, link });
        // Automatically open if it's the first favorite added
        if (favorites.length === 1) {
            document.getElementById('favorites-content').classList.add('is-open');
            document.getElementById('dropdown-icon').classList.add('rotate-180');
        }
    } else {
        favorites = favorites.filter(f => f.id !== id);
    }

    updateUI();
}

/// Copy Logic
// 1. Identify the logic for any element that should trigger the copy popup
const HOLD_DURATION = 950;
let holdTimer;

// Use 'pointerdown' as it's the modern way to handle both Mouse and Touch
document.addEventListener('pointerdown', (e) => {
    // Find if the clicked element (or its parents) is a card
    const card = e.target.closest('[data-id], .swiper-slide .relative');
    
    // Ignore if it's the heart button or if no card was found
    if (!card || e.target.closest('.heart-btn')) return;

    const linkToCopy = card.dataset.link;
    if (!linkToCopy) return;

    holdTimer = setTimeout(() => {
        showPopup(linkToCopy);
    }, HOLD_DURATION);
});

// Cancel the timer if the user stops clicking/touching
const cancelEvents = ['pointerup', 'pointerleave', 'pointercancel', 'dragstart'];
cancelEvents.forEach(eventType => {
    document.addEventListener(eventType, () => {
        clearTimeout(holdTimer);
    });
});

// 2. The Pop-up Functions (Keep these as they were)
function showPopup(url) {
    currentUrl = url;
    const popup = document.getElementById('copy-popup');
    const popupContent = document.getElementById('popup-content');
    
    popup.classList.remove('hidden');
    setTimeout(() => {
        popupContent.classList.remove('scale-95', 'opacity-0');
        popupContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closePopup() {
    const popup = document.getElementById('copy-popup');
    const popupContent = document.getElementById('popup-content');
    popupContent.classList.replace('scale-100', 'opacity-100', 'scale-95');
    popupContent.classList.add('opacity-0');
    setTimeout(() => popup.classList.add('hidden'), 300);
}

const confirmBtn = document.getElementById('confirm-copy');
let currentUrl = ""; // This global variable stores the URL when showPopup is called


function showPopup(url) {
    currentUrl = url; // Store the URL of the specific image held
    const popup = document.getElementById('copy-popup');
    const popupContent = document.getElementById('popup-content');
    
    popup.classList.remove('hidden');
    setTimeout(() => {
        popupContent.classList.remove('scale-95', 'opacity-0');
        popupContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Copy function
confirmBtn.onclick = () => {
    if (!currentUrl) return;

    navigator.clipboard.writeText(currentUrl).then(() => {
        // Visual feedback: Change button state
        const originalText = confirmBtn.innerText;
        confirmBtn.innerText = "Copied!";
        confirmBtn.classList.replace('bg-indigo-600', 'bg-green-500');
        
        // Close after a short delay so they see the "Copied!" message
        setTimeout(() => {
            closePopup();
            
            // Reset button style after the popup is hidden
            setTimeout(() => {
                confirmBtn.innerText = originalText;
                confirmBtn.classList.replace('bg-green-500', 'bg-indigo-600');
            }, 300);
        }, 800);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert("Text selection failed. Please try again.");
    });
};