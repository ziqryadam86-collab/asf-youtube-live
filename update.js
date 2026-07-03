const { execSync } = require('child_process');
const fs = require('fs');

const youtubeUrl = 'https://m.youtube.com/astroawani/live';
const offlineVideoUrl = 'https://error-9vs.pages.dev/playlist.m3u8';

async function main() {
    let realM3u8Url = "";

    // --- KAEDAH 1: Cuba guna yt-dlp dahulu ---
    try {
        console.log("Mencuba kaedah 1: Mengambil URL m3u8 menggunakan yt-dlp...");
        realM3u8Url = execSync(`yt-dlp --cookies cookies.txt -g -f "best[ext=mp4]/best" ${youtubeUrl}`).toString().trim();
    } catch (e) {
        console.log("Kaedah 1 (yt-dlp) gagal atau tiada format dikesan.");
    }

    // --- KAEDAH 2: Jika yt-dlp gagal, bertukar kepada curl sebagai backup ---
    if (!realM3u8Url || !realM3u8Url.startsWith("http")) {
        try {
            console.log("Mencuba kaedah 2: Bertukar kepada curl sebagai backup...");
            const curlCmd = `curl -s -L -b cookies.txt -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${youtubeUrl}" | grep -o 'https://manifest.googlevideo.com/[^"]*'`;
            
            const curlOutput = execSync(curlCmd).toString().trim();
            if (curlOutput) {
                // Ambil baris pertama jika hasil grep mengeluarkan lebih daripada satu URL
                realM3u8Url = curlOutput.split('\n')[0].trim();
            }
        } catch (curlError) {
            console.log("Kaedah 2 (curl) juga gagal.");
        }
    }

    // --- PROSES MENULIS FAIL M3U8 ---
    if (realM3u8Url && realM3u8Url.startsWith("http")) {
        // JIKA JUMPA LIVE STREAM (Yt-dlp atau Curl berjaya)
        console.log("🎉 BERJAYA MENEMUI LIVE! Membina chunklist dengan stream YouTube.");
        const m3u8Content = `#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2392187,CODECS="avc1.4D4029,mp4a.40.5",RESOLUTION=960x540,FRAME-RATE=25
${realM3u8Url}`;

        fs.writeFileSync('chunklist.m3u8', m3u8Content);
    } else {
        // JIKA KEDUA-DUA KAEDAH GAGAL (Saluran offline / tiada live langsung)
        console.log("⚠️ Live Stream tidak ditemui. Memasukkan video offline sandaran.");
        const fallbackContent = `#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2000000,RESOLUTION=1280x720
${offlineVideoUrl}`;

        fs.writeFileSync('chunklist.m3u8', fallbackContent);
    }
    
    console.log("Proses kemas kini fail chunklist.m3u8 selesai!");
}

main();
    
