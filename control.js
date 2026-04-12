/**
 * A universal function to batch update records in Supabase.
 * @param {string} table - The name of the table (e.g., 'novels')
 * @param {Array} payload - Array of objects containing the ID and the fields to update
 */

// After document load
const supabaseUrl = window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5500/index/home%20test.html' 
    : 'https://vpxnqmcerpsveoykztjg.supabase.co'; // Or leave blank and let Vercel handle it

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5xbWNlcnBzdmVveWt6dGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzE1NTIsImV4cCI6MjA5MDk0NzU1Mn0.BMwGIkKIHqnCMsV6YdtZzxBeIy6vJuPFgUPrMuOS56A';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Novel
const novel_list = []
const HASH_REGEX = /\/covers\/([^\/\s]+)/;


window.loadUserNovels = loadUserNovels; // Make it globally available.
window.saveNovel = saveNovel;
window.toggleModal = toggleModal;

supabaseClient.auth.onAuthStateChange((event, session) => {
    const overlay = document.getElementById('login-overlay');
    
    if (session) {
        overlay.classList.add('hidden');
        loadUserNovels();
    } else {
        overlay.classList.remove('hidden');
    }
});

// Check if already logged in
async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById('login-overlay').classList.add('hidden');
        loadUserNovels(); // This is safe now
    }
}

checkUser();


// UI Control
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

// ------ ------ -------- 🍀
// Novel
// Animation while client works with loadUserNovel()

function getSkeletonHTML() {
    // We create 8 placeholder cards that pulse
    return Array(8).fill(0).map(() => `
        <div class="animate-pulse relative overflow-hidden rounded-2xl bg-gray-200 aspect-[3/4]">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-300 via-transparent to-transparent p-6 flex flex-col justify-end">
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    `).join('');
}


async function loadUserNovels() {
    const gallery = document.getElementById('novel-gallery');
    
    // 1. Initial State: Show Pulse Skeletons while we talk to Supabase
    // This fills the space so the page doesn't jump.
    gallery.innerHTML = Array(8).fill(0).map(() => `
        <div class="animate-pulse relative overflow-hidden rounded-2xl bg-gray-200 aspect-[3/4]">
            <div class="absolute inset-0 bg-gradient-to-t from-gray-300 via-transparent to-transparent p-6 flex flex-col justify-end">
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    `).join('');

    try {
        // 2. Faster session check
        const { data: { session } } = await supabaseClient.auth.getSession();
        const user = session?.user;

        if (!user) {
            gallery.innerHTML = '<p class="text-gray-400 p-10 text-center col-span-full">Please log in to view your library.</p>';
            return;
        }

        // 3. Fetch Novels
        const { data: novels, error } = await supabaseClient
            .from('novels')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!novels || novels.length === 0) {
            gallery.innerHTML = '<p class="text-gray-400 p-10 text-center col-span-full">No novels found in your library.</p>';
            return;
        }

        // 4. Build the HTML String
        const htmlContent = novels.map((novel, index) => {
            // Extract hash from cover
            const c_url = novel.cover_url;
            const match = c_url.match(HASH_REGEX);
            var nv_hash = "";

            // Check if a match was found and extract the first group
            if (match && match[1]) {
                nv_hash = match[1];
            } else {
                // Special case, another feature
            }


            // Logic for final link
            const finalLink = (novel.last_chapter && novel.novel_hash)
                ? `https://fucknovelpia.com/chapter.php?hash=${novel.novel_hash}&ch=${novel.last_chapter}`
                : novel.novel_url;
            
            if (!novel_list.find(n => n.id === novel.id)) {
                novel_list.push({
                    id: novel.id,
                    hash: novel.novel_hash || nv_hash,
                    cover_url: novel.cover_url,
                    last_chapter: novel.last_chapter,
                    title: novel.title // Good to have for searching later
                });
            }

            return `
                <div class="novel-card animate-card-enter relative overflow-hidden rounded-2xl bg-gray-100 group cursor-pointer aspect-[3/4]" 
                    style="animation-delay: ${index * 60}ms;" 
                    data-id="${novel.id}" 
                    data-link="${finalLink}"
                    data-uid="${novel.novel_hash || nv_hash}">
                    
                    <img src="${novel.cover_url}" 
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        onerror="this.src='https://via.placeholder.com/300x400?text=No+Cover'">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 class="text-white text-sm sm:text-base md:text-lg font-bold font-gog">
                            ${novel.title}
                        </h3>

                        <p class="text-blue-300 text-xs font-dms mt-0.5 sm:mt-1 font-bold">
                            New Novel
                        </p>

                        <p class="text-gray-300 text-xs font-dms mt-1 hidden sm:block">
                            ${novel.tags && novel.tags.length > 0 
                                ? novel.tags.slice(0, 2).join(' • ') 
                                : 'No Tags'}
                        </p>
                    </div>
                    
                    <button onclick="toggleFavorite(this)" 
                            class="heart-btn absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-white/40">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 pointer-events-none">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // 5. Final Render: Wait for the next paint frame to avoid the "Flash"
        requestAnimationFrame(() => {
            gallery.innerHTML = htmlContent;
        });

    } catch (err) {
        console.error("Gallery Load Error:", err);
        gallery.innerHTML = '<p class="text-red-400 text-center col-span-full">Something went wrong while loading.</p>';
    }
}

function toggleModal(show) {
    document.getElementById('add-novel-modal').classList.toggle('hidden', !show);
}


async function saveNovel() {
    const novelUrl = document.getElementById('novel-url').value;
    if (!novelUrl) return;

    try {
        updateStatus("Talking with Vercel...");
        const response = await fetch(`/api/fetch-novel?url=${encodeURIComponent(novelUrl)}`);
        const scrapedData = await response.json();

        if (scrapedData.error) throw new Error(scrapedData.error);

        // --- THE MISSING PIECE ---
        updateStatus("Identifying User...");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !userData.user) {
            throw new Error("You must be logged in to save novels!");
        }
        
        const userId = userData.user.id; // This is the 'user' variable you were missing!
        // -------------------------

        const tagsToSave = scrapedData.tags && Array.isArray(scrapedData.tags) 
            ? scrapedData.tags 
            : [];

        // console.log("Scraped Data:", scrapedData)
        // console.log(scrapedData.novel_hash)
        // console.log(scrapedData.description)


        updateStatus("Saving to Library...");
        const { error: dbError } = await supabaseClient
            .from('novels')
            .insert([{ 
                title: scrapedData.title, 
                novel_url: novelUrl, 
                cover_url: scrapedData.cover, 
                description: scrapedData.description || "",
                tags: tagsToSave,
                novel_hash: scrapedData.novel_hash,
                user_id: userId // Use the ID we just fetched
            }]);

        if (dbError) throw dbError;

        updateStatus("Success!", false);
        toggleModal(false);
        loadUserNovels(); 


    } catch (err) {
        console.error(err);
        updateStatus("Error: " + err.message);
        setTimeout(() => updateStatus("", false), 3000);
    }
}

async function sync_novels() {
    try {
        const response = await fetch('api/sync-progress');
        if (!response.ok) throw new Error("Failed to fetch data");

        const string = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(string, 'text/html');
        
        // 1. Convert all H2s to an array and find the one with our title
        const headers = Array.from(doc.querySelectorAll('h2'));
        const targetHeader = headers.find(h => h.textContent.includes("Recent progress"));

        let chaptersArray = [];

        if (targetHeader) {
            // 2. Move to the parent <section> or search the next sibling for the .grid
            const section = targetHeader.closest('section'); 
            const grid = section.querySelector('.grid');

            if (grid) {
                // 3. Only pull items from WITHIN this specific grid
                const items = grid.querySelectorAll('.item');
                
                chaptersArray = Array.from(items).map(item => {
                    const hash = item.querySelector('.k')?.innerText.trim();
                    const info = item.querySelector('.v')?.innerText.trim() || "";

                    // Extract digits after "Chapter "
                    const match = info.match(/Chapter\s+(\d+)/);
                    const chapterDigits = match ? match[1] : "0";
                    
                    // Pad to 4 digits (e.g., 0001)
                    const formattedChapter = chapterDigits.padStart(4, '0');

                    return {
                        novel_hash: hash,
                        original_cid: info,
                        formatted_cid: formattedChapter
                    };
                });
            }
        }

        return chaptersArray;

    } catch (err) {
        console.error("Sync Error:", err.message);
    }
}

const data = [
    {
        novel_hash: '6e26208800d6e71c54952ff8308e75d5a0b2153e',
        original_cid: 'Chapter 118 · 2026-04-11 16:51:27',
        formatted_cid: '0118'
    },
    {
        novel_hash: '9d9dc216ed65ebfdd3cb98ca18b38a985a14c5c8',
        original_cid: 'Chapter 1 · 2026-04-10 15:03:39',
        formatted_cid: '0001'
    },
    {
        novel_hash: '63df510dc2b4721391e0b0b3801fd676562b68db',
        original_cid: 'Chapter 19 · 2026-04-10 14:54:06',
        formatted_cid: '0019'
    },
    {
        novel_hash: '46b4e8efbf39422b3ba1608b6012890f6ee86c05',
        original_cid: 'Chapter 9 · 2026-04-10 11:20:19',
        formatted_cid: '0009'
    },
    {
        novel_hash: '69d94906e301314ac322b83d5af51d5944f75079',
        original_cid: 'Chapter 3001 · 2026-04-10 11:08:04',
        formatted_cid: '3001'
    },
    {
        novel_hash: '54eb0ed9362ddd630c82399b2b939bc684dfaac1',
        original_cid: 'Chapter 21 · 2026-04-10 10:20:29',
        formatted_cid: '0021'
    }
]

// sync_novel() get the return data from sync-progress serverless function like temp data
// Novel_list have finished when the website is loaded.



/**
 * Universal batch update
 */
async function supa_update(table, payload) {
    if (payload.length === 0) return;

    const { error } = await supabaseClient
        .from(table)
        .upsert(payload, { onConflict: 'id' });

    if (error) {
        console.error("Batch Update Error:", error);
    } else {
        console.log(`Successfully updated ${payload.length} records in ${table}.`);
    }
}

async function filter_hash(synced_data, novel_list) {
    const novelMap = new Map(synced_data.map(item => [item.novel_hash, item]));
    const updatesNeeded = [];

    for (const hero of novel_list) {
        if (!hero.hash && hero.cover_url) {
            const match = hero.cover_url.match(HASH_REGEX);
            if (match) hero.hash = match[1];
        }

        const syncInfo = novelMap.get(hero.hash);

        if (syncInfo) {
            const latest_incoming_cid = Number(syncInfo.formatted_cid);
            const current_local_cid = Number(hero.last_chapter || 0);

            // CASE A: Normal Sync (Incoming is newer)
            if (latest_incoming_cid > current_local_cid) {
                updatesNeeded.push({ 
                    id: hero.id, 
                    last_chapter: syncInfo.formatted_cid,
                    sync_debt: false 
                });
            } 
            // CASE B: Sync Debt (Incoming is OLDER than Supabase)
            else if (latest_incoming_cid < current_local_cid) {
                updatesNeeded.push({
                    id: hero.id,
                    last_chapter: hero.last_chapter,
                    sync_debt: true,
                    debt_cid: syncInfo.formatted_cid
                });
            }
        }
    }

    // 2. CRITICAL: Place the call BEFORE the return statement
    if (updatesNeeded.length > 0) {
        await supa_update('novels', updatesNeeded);
    }

    return updatesNeeded;
}

function edit(item){
    const div = document.getElementById(`${item.id}`);
}

// Create a function which creates the hashes for the just by cover.


async function auto_sync() {
    try {
        const synced_data = await sync_novels(); 
        console.log(synced_data)
        
        filter_hash(synced_data, novel_list).then(updates => {
            console.log("Process complete. Updates sent:", updates);
        });
        
    } catch (error) {
        console.error("Failed to fetch novels:", error);
    }
}
// let's active after I built a loop
auto_sync()



function updateStatus(message, isVisible = true) {
    const container = document.getElementById('status-container');
    const text = document.getElementById('status-text');
    const saveBtn = document.getElementById('save-btn');

    if (isVisible) {
        container.classList.remove('hidden');
        text.innerText = message;
        saveBtn.disabled = true; // Stop double-clicking
    } else {
        container.classList.add('hidden');
        saveBtn.disabled = false;
    }
}

// Small helper to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// <--- Overlay! --> 

// 2. The Login Function
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        errorEl.innerText = error.message;
        errorEl.classList.remove('hidden');
    } else {
        document.getElementById('login-overlay').classList.add('hidden');
        loadUserNovels(); 
    }
}

// 3. Make it visible to the HTML button
window.handleLogin = handleLogin;


