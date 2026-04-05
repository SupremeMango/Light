export default async function handler(req, res) {
    // Vercel Serverless gives us 'req.query' automatically
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

        // Simple Regex for your specific target site
        const titleMatch = html.match(/<h1 class="hero-title">([^<]+)<\/h1>/);
        const coverMatch = html.match(/class="cover\s*" style="background-image:url\(([^)]+)\)"/);
        
        const data = {
            title: titleMatch ? titleMatch[1].trim() : "Unknown Title",
            cover: coverMatch ? coverMatch[1] : "",
            url: url
        };

        // Explicitly set the header to JSON
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}