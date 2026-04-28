# Installing QR Asset Scanner on Your iPhone

## For Team Members

### Step 1: Register Your Device

1. On your iPhone, open Safari and go to the device registration URL (provided by your project admin)
2. Tap **"Download profile"** when prompted
3. Go to **Settings > General > VPN & Device Management**
4. Tap the downloaded profile and tap **Install**
5. This registers your iPhone's UDID with the developer account

### Step 2: Get the App

Once the admin has rebuilt the app with your device included:

1. Open the build link (sent to you by the admin) on your iPhone in Safari
2. Tap **Install**

### Step 3: Trust the Developer

After installing, the app won't open until you trust the developer certificate:

1. Go to **Settings > General > VPN & Device Management**
2. Find the developer certificate
3. Tap **Trust**

### Step 4: Log In

Use the credentials provided by your admin. Demo accounts:

- **Field Worker:** `field@demo.com` / `password123`
- **Office Staff:** `office@demo.com` / `password123`

---

## For the Admin (Build & Device Management)

### Device Registration URL

```
https://expo.dev/register-device/2628e94e-6c96-4cd3-b753-3f859707a23d
```

Send this link to any colleague who needs to install the app.

### View Registered Devices

```
npx eas-cli device:list
```

### Build for iPhone (Ad Hoc)

After new devices are registered, rebuild so they're included in the provisioning profile:

```
cd <repo-folder>
npx eas-cli build --profile preview --platform ios
```

### List Past Builds

```
npx eas-cli build:list --platform ios
```

### Share a Build

After a build completes, EAS provides a URL like:
```
https://expo.dev/accounts/eenglish/projects/QR_Asset_Scanner/builds/...
```

Send this to colleagues — they open it in Safari on their iPhone to install.

### Notes

- Each time a **new device** is registered, you must **rebuild** for it to be installable on that device
- Builds use the `preview` profile (ad hoc distribution)
- Apple allows up to 100 devices per developer account for ad hoc distribution
- Apple Team ID: `3K94LXF39A`
- Bundle ID: `com.qrassetscanner.app`
