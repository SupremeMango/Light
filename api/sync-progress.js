export default async function handler(req, res) {
    const cookie = process.env.FNOVELPIA_COOKIES; 

    if (!cookie) {
        return res.status(500).json({ error: "Cookie variable is empty!" });
    }

    try {
        const response = await fetch("https://fucknovelpia.com/profile/", {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-CH-UA': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'Sec-CH-UA-Mobile': '?0',
                'Sec-CH-UA-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
        });

        const html = await response.text();

        // Check if we got redirected or the cookie failed
        if (html.includes("Sign in") || html.includes("login")) {
            console.warn("⚠️ Site redirected to Login. Cookie might be expired or blocked.");
            // You might want to return an error here instead of the login page HTML
        }

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);

    } catch (error) {
        console.error("Fetch error:", error);
        return res.status(500).json({ error: error.message });
    }
}
