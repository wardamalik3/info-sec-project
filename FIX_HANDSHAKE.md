# Fix: Invalid Signature During Key Exchange

## ❌ Error
```
Handshake failed: Invalid signature during key exchange
```

## 🔍 Root Cause
This error occurs when the **keys don't match** between:
- The keys stored in the **database** (server-side)
- The keys stored in the **browser** (client-side IndexedDB)

This typically happens when:
1. A user re-registered (generating new keys)
2. A user cleared browser data but didn't re-register
3. A user is using a different browser/device than where they registered

## ✅ Solution: Fresh Re-registration

### Step 1: Clear Everything

#### A. Clear Database (Server-side)
```bash
# In the server folder
cd c:\Users\amnah\OneDrive\Desktop\InfoSec_Proj\server
node clear_users.js
```

You should see:
```
All users cleared from database
```

#### B. Clear Browser Data (Client-side)

**For Bob2's Browser:**
1. Press F12 to open DevTools
2. Go to "Application" tab
3. Click "Storage" in left sidebar
4. Click "Clear site data" button
5. Confirm and close DevTools
6. Refresh the page (F5)

**For Alice's Browser:**
1. Press F12 to open DevTools
2. Go to "Application" tab
3. Click "Storage" in left sidebar
4. Click "Clear site data" button
5. Confirm and close DevTools
6. Refresh the page (F5)

### Step 2: Register Both Users Fresh

**Bob2's Browser:**
1. Go to http://localhost:5173
2. Click "Register here"
3. Username: `bob2`
4. Password: `password123` (or any password)
5. Click "Register"
6. You should see: "Registration successful! Please login."
7. Login with the same credentials
8. **Keep this window open!**

**Alice's Browser:**
1. Go to http://localhost:5173
2. Click "Register here"
3. Username: `alice`
4. Password: `password123` (or any password)
5. Click "Register"
6. You should see: "Registration successful! Please login."
7. Login with the same credentials
8. **Keep this window open!**

### Step 3: Verify Both Are Connected

**Bob2's Browser Console (F12):**
```
Should see: "Registered socket for bob2"
```

**Alice's Browser Console (F12):**
```
Should see: "Registered socket for alice"
```

### Step 4: Initiate Handshake

**Bob2's Browser:**
1. In the "Start Chat" section
2. Enter: `alice`
3. Click "Connect"
4. You should see alert: "Handshake sent to alice! Waiting for reply..."

**Alice's Browser:**
- Should automatically show alert: "Secure connection established with bob2"
- Green "SESSION KEY DERIVED" panel should appear

**Bob2's Browser:**
- Green "SESSION KEY DERIVED" panel should appear
- Both can now send encrypted messages!

## 🎯 Success Indicators

### Bob2's Debug Logs:
```
Starting chat with alice
Fetching alice's public keys from server...
✓ Retrieved alice's public keys
🔑 Deriving AES-GCM 256-bit session key using ECDH...
✅ Session key derived successfully!
📊 Key: AES-GCM-256 | Preview: a1b2c3d4...
Handshake sent to alice
```

### Alice's Debug Logs:
```
Received handshake from bob2
Processing handshake from bob2
Fetching bob2's public keys from server...
✓ Retrieved bob2's signing key
🔑 Deriving AES-GCM 256-bit session key using ECDH...
✅ Session key derived successfully!
📊 Key: AES-GCM-256 | Preview: a1b2c3d4...
Shared Key Established with bob2
```

### Server Console:
```
User registered: bob2 -> <socket-id-1>
User registered: alice -> <socket-id-2>
[DEBUG] Received message from bob2 to alice (Type: handshake)
[SUCCESS] Message sent from bob2 to alice (<socket-id-2>)
```

## 🚨 Still Getting Error?

If you still see "Invalid signature" after following all steps:

### Check 1: Keys Are Fresh
Run this in **both** browser consoles:
```javascript
// Check when keys were created
indexedDB.databases().then(dbs => console.log('Databases:', dbs));
```

### Check 2: Verify Registration
Run this in server folder:
```bash
node view_user_keys.js
```

You should see both users with their public keys.

### Check 3: Network Issues
Check browser Network tab (F12 → Network):
- Look for the handshake WebSocket message
- Check if it's being sent/received

### Check 4: Try Incognito Mode
1. Open two incognito windows
2. Register both users fresh
3. Test handshake

## 💡 Prevention

To avoid this error in the future:

1. **Never clear browser data** without re-registering
2. **Always use the same browser** where you registered
3. **If you re-register**, make sure to logout all other sessions first
4. **Keys are device-specific** - you can't login from a different device with the same account

## 🔄 Quick Reset Command

If you need to reset everything quickly:

```bash
# In server folder
cd c:\Users\amnah\OneDrive\Desktop\InfoSec_Proj\server
node clear_users.js

# Then in both browsers:
# F12 → Application → Clear site data → Refresh
# Register both users fresh
```
