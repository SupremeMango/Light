// import { createClient } from '@supabase/supabase-js';
// import * as cheerio from 'cheerio';

// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// export default async function handler(req, res) {
//     try {
//         const cookie = process.env.NOVELPIA_COOKIE;
        
//         if (!cookie) {
//             return res.status(400).json({ error: "No cookie found in Vercel settings" });
//         }

//         const response = await fetch("https://fucknovelpia.com/profile/", {
//             headers: { 
//                 "Cookie": cookie,
//                 "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"
//             }
//         });

//         const html = await response.text();
//         const $ = cheerio.load(html);
        
//         // Debug check: does the profile even load?
//         if (!html.includes('grid')) {
//             return res.status(401).json({ error: "Session expired or invalid cookie" });
//         }

//         const updates = [];
//         $('.grid .item').each((i, el) => {
//             const hash = $(el).find('.k').text().trim();
//             const vText = $(el).find('.v').text().trim();
            
//             // Extract the number part
//             const chapterMatch = vText.match(/Chapter\s*(\d+)/i);
            
//             if (hash && chapterMatch) {
//                 let rawChapter = chapterMatch[1]; // This is "19" or "110"
                
//                 // PAD LOGIC: Make it 4 digits (e.g., "0019")
//                 const paddedChapter = rawChapter.padStart(4, '0');

//                 updates.push({ 
//                     novel_hash: hash, 
//                     last_chapter: paddedChapter // Store as String "0019"
//                 });
//             }
//         });

//         // Use UPSERT: This updates existing rows based on the novel_hash
//         // and ignores novels that aren't in your DB yet.
//         const { error } = await supabase
//             .from('novels')
//             .upsert(updates, { onConflict: 'novel_hash' });

//         if (error) throw error;

//         res.status(200).json({ success: true, count: updates.length });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message });
//     }
// }