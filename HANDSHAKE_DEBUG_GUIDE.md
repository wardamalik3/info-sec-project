# Handshake Debugging Guide

## Common Issues and Solutions

### Issue 1: Users Not Connected Simultaneously
**Problem**: The handshake requires BOTH users to be online at the same time.

**Solution**:
1. Open TWO browser windows/tabs
2. In Window 1: Login as User A (e.g., "alice")
3. In Window 2: Login as User B (e.g., "bob")
4. Keep BOTH windows open
5. In Window 1: Enter "bob" in the username field and click "Connect"
6. Window 2 should receive the handshake automatically

### Issue 2: Socket Not Registered
**Problem**: User logged in but socket wasn't registered properly.

**Check**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `Registered socket for <username>`
4. If you don't see this, refresh the page

### Issue 3: Case Sensitivity
**Problem**: Username case doesn't match exactly.

**Solution**:
- If you registered as "Alice", you must connect to "Alice" (not "alice")
- The server now has case-insensitive matching, but check the exact username

### Issue 4: Keys Not Generated
**Problem**: User didn't register properly, so keys don't exist.

**Check**:
1. Open DevTools → Application → IndexedDB → keyStore
2. You should see 4 keys:
   - encPrivateKey
   - encPublicKey  
   - signPrivateKey
   - signPublicKey
3. If missing, logout and register again

## Step-by-Step Testing Procedure

### Setup (Do this ONCE):
1. Clear browser data (Ctrl+Shift+Delete)
2. Register User 1 (e.g., "alice" / "password123")
3. Logout
4. Register User 2 (e.g., "bob" / "password123")
5. Logout

### Testing Handshake:
1. **Window 1**: Login as "alice"
   - Check console for: `Registered socket for alice`
   
2. **Window 2**: Login as "bob"  
   - Check console for: `Registered socket for bob`
   
3. **Window 1**: 
   - Enter "bob" in the recipient field
   - Click "Connect"
   - You should see:
     - Alert: "Handshake sent to bob! Waiting for reply..."
     - Debug log: "Handshake sent to bob"
     - Session key panel appears
   
4. **Window 2**:
   - Should automatically receive handshake
   - Alert: "Secure connection established with alice"
   - Session key panel appears
   
5. **Both Windows**:
   - Should now be able to send encrypted messages

## What to Check in Browser Console

### Expected Logs (Window 1 - Initiator):
```
Registered socket for alice
Starting chat with bob
🔑 Deriving AES-GCM 256-bit session key using ECDH...
✅ Session key derived successfully!
📊 Key: AES-GCM-256 | Preview: a1b2c3d4...
Handshake sent to bob
```

### Expected Logs (Window 2 - Responder):
```
Registered socket for bob
Received handshake from alice
Processing handshake from alice
🔑 Deriving AES-GCM 256-bit session key using ECDH...
✅ Session key derived successfully!
📊 Key: AES-GCM-256 | Preview: a1b2c3d4...
Shared Key Established with alice
```

## Server Console Checks

The server should show:
```
User registered: alice -> <socket-id-1>
User registered: bob -> <socket-id-2>
[DEBUG] Received message from alice to bob (Type: handshake)
[SUCCESS] Message sent from alice to bob (<socket-id-2>)
```

## Common Error Messages

### "User not found or offline"
- **Cause**: Recipient is not logged in
- **Fix**: Make sure both users are logged in simultaneously

### "Handshake failed: Invalid signature"
- **Cause**: Keys are corrupted or mismatched
- **Fix**: Clear IndexedDB and re-register both users

### "Private keys not found on this device"
- **Cause**: Logged in on a different browser/device than where you registered
- **Fix**: Register again on this device

### No alert/response after clicking Connect
- **Cause**: Socket not connected or recipient offline
- **Fix**: 
  1. Check both browser consoles for socket registration
  2. Refresh both pages
  3. Check server console for connection logs

## Quick Diagnostic Commands

Open browser console and run:

```javascript
// Check if socket is connected
console.log('Socket connected:', socket.connected);

// Check current user
console.log('Current user:', JSON.parse(localStorage.getItem('user')));

// Check if keys exist
(async () => {
  const { getKey } = await import('./utils/keyStorage');
  console.log('Keys:', {
    encPrivate: !!(await getKey('encPrivateKey')),
    encPublic: !!(await getKey('encPublicKey')),
    signPrivate: !!(await getKey('signPrivateKey')),
    signPublic: !!(await getKey('signPublicKey'))
  });
})();
```

## Still Not Working?

If handshake still fails after following all steps:

1. **Check Network Tab** (DevTools → Network → WS):
   - Should see WebSocket connection to `ws://localhost:5000`
   - Should see messages being sent

2. **Check Server Logs**:
   - Look for any error messages
   - Verify both users are in the userSockets Map

3. **Try Incognito Mode**:
   - Open two incognito windows
   - Register and test fresh

4. **Restart Everything**:
   - Stop both client and server (Ctrl+C)
   - Clear MongoDB: `node server/clear_users.js`
   - Restart server: `npm run dev` (in server folder)
   - Restart client: `npm run dev` (in client folder)
   - Register both users fresh
   - Test again
