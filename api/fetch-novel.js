export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: "No URL provided" });

    try {
        const response = await fetch(url);
        const html = await response.text();

        // 1. Extract Title
        const titleMatch = html.match(/<h1 class="hero-title">([^<]+)<\/h1>/);
        const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

        // 2. Extract Description (Summary)
        const summaryMatch = html.match(/<p class="hero-summary">([\s\S]*?)<\/p>/);
        const summary = summaryMatch ? summaryMatch[1].trim() : "";

        // 3. Extract Cover Image URL from the style attribute
        // This looks for: background-image:url( ... )
        const coverMatch = html.match(/class="cover\s*" style="background-image:url\(([^)]+)\)"/);
        const cover = coverMatch ? coverMatch[1] : "";

        // 4. Extract Tags
        const tagMatches = [...html.matchAll(/class="tag-pill">([^<]+)<\/a>/g)];
        const tags = tagMatches.map(match => match[1].trim());

        // Send the data back to your frontend
        res.status(200).json({ title, summary, cover, tags });

    } catch (error) {
        res.status(500).json({ error: "Failed to scrape site" });
    }
}