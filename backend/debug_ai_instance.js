async function test() {
    try {
        const m = await import('./ai/genkit.ts');
        const ai = m.ai || (m.default && m.default.ai);
        console.log('AI instance found:', !!ai);
        if (ai) {
            console.log('AI.generate exists:', typeof ai.generate);
            // DO NOT ACTUALLY CALL GENERATE HERE TO AVOID API USAGE unless needed
        } else {
            console.log('AI instance is undefined');
            console.log('m:', m);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
