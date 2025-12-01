// Quick Diagnostic Script
// Run this in the browser console to check the state

console.log('=== DIAGNOSTIC REPORT ===\n');

// 1. Check current user
const user = JSON.parse(localStorage.getItem('user'));
console.log('1. Current User:', user ? user.username : 'NOT LOGGED IN');

// 2. Check socket connection
console.log('2. Socket Status:', typeof socket !== 'undefined' ? (socket.connected ? '✅ Connected' : '❌ Disconnected') : '❌ Not initialized');

// 3. Check keys in IndexedDB
(async () => {
    try {
        const { getKey } = await import('./src/utils/keyStorage.js');

        const encPrivate = await getKey('encPrivateKey');
        const encPublic = await getKey('encPublicKey');
        const signPrivate = await getKey('signPrivateKey');
        const signPublic = await getKey('signPublicKey');

        console.log('3. Keys Status:');
        console.log('   - Encryption Private Key:', encPrivate ? '✅ Present' : '❌ Missing');
        console.log('   - Encryption Public Key:', encPublic ? '✅ Present' : '❌ Missing');
        console.log('   - Signing Private Key:', signPrivate ? '✅ Present' : '❌ Missing');
        console.log('   - Signing Public Key:', signPublic ? '✅ Present' : '❌ Missing');

        if (encPublic) {
            console.log('\n4. Your Public Key (for sharing):');
            console.log(JSON.stringify(encPublic, null, 2));
        }

        console.log('\n=== END DIAGNOSTIC ===');
        console.log('\n💡 If any keys are missing, you need to logout and register again.');

    } catch (err) {
        console.error('Error checking keys:', err);
        console.log('3. Keys Status: ❌ Error checking keys');
    }
})();
