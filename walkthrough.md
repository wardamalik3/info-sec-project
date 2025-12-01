# Logging & Security Auditing Walkthrough

This guide explains how to generate and view the security logs for your report.

## 1. Accessing the Logs
Navigate to the **Security Logs** page in your browser:
`http://localhost:5173/logs` (or wherever your client is running)

This page displays a real-time table of all security events.

## 2. Generating Logs for the Report

Perform the following actions to populate the logs with data for your screenshots:

### A. Authentication Attempts
1. **Register a new user**: Go to `/register` and create a new account (e.g., `Eve`).
   - *Log Event*: `AUTH_REGISTER_SUCCESS`
2. **Login**: Log in with an existing user.
   - *Log Event*: `AUTH_LOGIN_SUCCESS`
3. **Failed Login**: Try to log in with a wrong password.
   - *Log Event*: `AUTH_LOGIN_FAIL`

### B. Key Exchange & Metadata Access
1. **Start a Chat**: Search for a user (e.g., `Bob`) and click "Connect".
   - *Log Event*: `KEY_FETCH` (Server-side metadata access)
   - *Log Event*: `KEY_EXCHANGE_INIT` (Initiator starting exchange)
   - *Log Event*: `KEY_EXCHANGE_SUCCESS` (Responder completing exchange)

### C. Message Decryption & Replay Attacks
1. **Send a Message**: Send a text message.
   - *Log Event*: `DECRYPTION_SUCCESS` (Implicit, or if you added success logs. Currently we log failures).
2. **Simulate Replay Attack** (Advanced):
   - If you can capture a message payload and send it again using a tool like Postman or a script, the system will detect it.
   - *Log Event*: `REPLAY_ATTACK_DETECTED`

### D. Invalid Signatures
- If a malicious actor tries to tamper with the key exchange signature, the system will log it.
- *Log Event*: `INVALID_SIGNATURE`

## 3. Taking Screenshots
Once you have generated these events, go back to the `/logs` page. You should see a colorful table listing all the events.
- **Take a screenshot of this table** for your report.
- Ensure the timestamp, event type, and details are visible.

## 4. Log File Location
The raw logs are also stored on the server at:
`server/logs/security.log`
You can include a snippet of this file in your report as well.
