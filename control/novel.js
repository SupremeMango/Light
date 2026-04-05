function toggleModal(show) {
    document.getElementById('add-novel-modal').classList.toggle('hidden', !show);
}

async function saveNovel() {
    const url = document.getElementById('novel-url').value;

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
        .from('novels') // Make sure your table is named 'novels' in Supabase
        .insert([
            { 
                title: title, 
                novel_url: url, 
                cover_url: cover, 
                user_id: user.id 
            }
        ]);

    if (error) {
        alert("Error saving: " + error.message);
    } else {
        toggleModal(false);
        // We'll build loadUserNovels() next to refresh your list!
        alert("Saved to your library!");
    }
}
window.saveNovel = saveNovel;
window.toggleModal = toggleModal;


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


async function saveNovel() {
    const novelUrl = document.getElementById('novel-url').value;
    if (!novelUrl) return;

    try {
        updateStatus("Talking with Vercel...");
        
        // Call your new API route
        const response = await fetch(`/api/fetch-novel?url=${encodeURIComponent(novelUrl)}`);
        const scrapedData = await response.json();

        if (scrapedData.error) throw new Error(scrapedData.error);

        updateStatus("Vercel found the novel: " + scrapedData.title);
        await sleep(800);

        // Save to Supabase
        updateStatus("Almost there! Saving to Library...");
        const { data: { user } } = await supabaseClient.auth.getUser();

        const { error } = await supabaseClient
            .from('novels')
            .insert([{ 
                title: scrapedData.title, 
                novel_url: novelUrl, 
                cover_url: scrapedData.cover, 
                description: scrapedData.summary,
                tags: scrapedData.tags, // Supabase handles arrays nicely
                user_id: user.id 
            }]);

        if (error) throw error;

        updateStatus("Success!", false);
        toggleModal(false);
        // Refresh UI here
    } catch (err) {
        console.error(err);
        updateStatus("Error: " + err.message);
        setTimeout(() => updateStatus("", false), 3000);
    }
}