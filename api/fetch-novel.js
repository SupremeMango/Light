export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();

        // 1. Improved Title Search
        const titleMatch = html.match(/<h1 class="hero-title">([^<]+)<\/h1>/);
        const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

        // 2. Aggressive Cover Search
        // This looks for any 'url(...)' inside a div that has the class 'cover'
        const coverRegex = /class="cover[^"]*"[^>]*style="[^"]*background-image:\s*url\(['"]?([^'")]+)['"]?\)/i;
        const coverMatch = html.match(coverRegex);
        const cover = coverMatch ? coverMatch[1] : "";

        // 3. Extract Tags (Optional, but nice to have)
        const tagMatches = [...html.matchAll(/class="tag-pill">([^<]+)<\/a>/g)];
        const tags = tagMatches.map(match => match[1].trim());

        // 4. Extract Novel Hash from URL
        let novel_hash = "";
        if (cover) {
            const hashMatch = cover.match(/\/covers\/([a-f0-9]+)\//);
            novel_hash = hashMatch ? hashMatch[1] : "";
        }

        res.status(200).json({ 
            title, 
            cover, 
            tags,
            url,
            novel_hash,
            last_chapter: "0001" // Default starting chapter count.
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}