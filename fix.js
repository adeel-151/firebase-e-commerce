const fs = require('fs');
const https = require('https');

const files = ['index.html', 'about.html', 'shop.html', 'js/app.js'];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301);
        }).on('error', () => resolve(false));
    });
}

async function fixImages() {
    let seedCount = 1;
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        let content = fs.readFileSync(file, 'utf8');
        const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+\?[^\s\"\'\>]+/g;
        const matches = content.match(regex);
        if (matches) {
            for (const url of [...new Set(matches)]) {
                const cleanUrl = url.replace(/[\"\'\>].*$/, '');
                const isWorking = await checkUrl(cleanUrl);
                if (!isWorking) {
                    console.log('Replacing broken URL:', cleanUrl);
                    const replacement = `https://picsum.photos/seed/lumiere${seedCount++}/800/1000`;
                    content = content.split(cleanUrl).join(replacement);
                }
            }
        }
        fs.writeFileSync(file, content);
    }
    console.log('Done fixing images');
}
fixImages();
