const path = require('path');
const fs = require('fs');

async function test() {
    try {
        const target = path.join(__dirname, 'ai', 'genkit.ts');
        console.log('Target path:', target);
        console.log('Exists:', fs.existsSync(target));
        
        // In tsx environment
        const m = await import('./ai/genkit.ts');
        console.log('Module keys:', Object.keys(m));
        console.log('m.ai:', !!m.ai);
        if (m.default) {
            console.log('m.default keys:', Object.keys(m.default));
            console.log('m.default.ai:', !!m.default.ai);
        }
    } catch (e) {
        console.error(e);
    }
}

test();
