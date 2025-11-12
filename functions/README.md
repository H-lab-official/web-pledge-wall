# Firebase Cloud Functions

API endpoints สำหรับ Pledge Wall

## Setup

```bash
cd functions
npm install
cd ..
```

## Build

```bash
cd functions
npm run build
cd ..
```

## Deploy

```bash
# จาก root directory
bun run deploy:functions

# หรือ
firebase deploy --only functions
```

## Local Development

```bash
# Build functions
cd functions
npm run build

# Run emulator
cd ..
firebase emulators:start --only functions

# หรือใช้ serve script
cd functions
npm run serve
```

## API Endpoints

หลังจาก deploy แล้ว:

- `getMessages` - GET endpoint สำหรับดึงข้อความที่อนุมัติแล้ว
- `healthCheck` - GET endpoint สำหรับ health check

URL format:
```
https://<region>-<project-id>.cloudfunctions.net/getMessages
https://<region>-<project-id>.cloudfunctions.net/healthCheck
```

