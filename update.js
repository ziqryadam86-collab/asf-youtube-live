const { execSync } = require('child_process');
const fs = require('fs');

const youtubeUrl = 'https://www.youtube.com/@lescopaque/live';

async function main() {
    try {
        console.log("Mengambil URL m3u8 dari YouTube menggunakan cookies...");
        
        // Menambah parameter --quiet dan mengurus ralat jika tiada live stream berjalan
        let realM3u8Url = "";
        try {
            realM3u8Url = execSync(`yt-dlp --cookies cookies.txt -g -f "best[ext=mp4]/best" ${youtubeUrl}`).toString().trim();
        } catch (e) {
            console.log("Saluran sedang tidak bersiaran langsung (No active live stream found).");
            // Cipta fail kosong atau mesej info supaya workflow tidak merah/error
            fs.writeFileSync('chunklist.m3u8', '#EXTM3U\n#INFO: Saluran sedang tidak bersiaran langsung.');
            return;
        }

        const m3u8Content = `#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2392187,CODECS="avc1.4D4029,mp4a.40.5",RESOLUTION=960x540,FRAME-RATE=25
${realM3u8Url}`;

        fs.writeFileSync('chunklist.m3u8', m3u8Content);
        console.log("Fail chunklist.m3u8 berjaya dikemas kini!");

    } catch (error) {
        console.error("Ralat tidak dijangka:", error.message);
        process.exit(1);
    }
}

main();
