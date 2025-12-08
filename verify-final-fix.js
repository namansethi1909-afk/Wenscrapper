const axios = require('axios');

async function verifyFinalFix() {
    try {
        console.log('🔍 Verifying Complete Skymute Fix...\n');

        const response = await axios.get('https://wenscrapper.onrender.com/trending');

        if (response.data.length > 0) {
            const first = response.data[0];

            console.log('✅ Complete API Response Format:');
            console.log(JSON.stringify(first, null, 2));

            console.log('\n📋 Field Checklist:');
            console.log('  - id:', first.id ? '✓' : '✗');
            console.log('  - title:', first.title ? '✓' : '✗');
            console.log('  - image:', first.image ? '✓' : '✗');
            console.log('  - thumbnail:', first.thumbnail ? '✓' : '✗');
            console.log('  - poster:', first.poster ? '✓' : '✗');
            console.log('  - url:', first.url ? '✓' : '✗');
            console.log('  - description:', first.description ? '✓' : '✗');
            console.log('  - provider:', first.provider ? '✓' : '✗');
            console.log('  - type:', first.type ? '✓' : '✗', `(${first.type})`);

            const allPresent = first.id && first.title && first.image && first.url && first.type;

            if (allPresent) {
                console.log('\n🎉 ALL REQUIRED FIELDS PRESENT!');
                console.log('\n📱 Use in Skymute:');
                console.log('https://wenscrapper.onrender.com/trending\n');
            } else {
                console.log('\n⚠️ Some fields missing!');
            }
        }

    } catch (error) {
        console.log('Error:', error.message);
    }
}

verifyFinalFix();
