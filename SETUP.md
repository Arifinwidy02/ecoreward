# Google Sign-In Setup

Panduan langkah demi langkah untuk mendapatkan Google Client ID dan mengonfigurasi Google Sign-In di Android & iOS.

---

## 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru (atau pilih project yang sudah ada)
3. Buka **APIs & Services** → **OAuth consent screen**
4. Pilih **External** (untuk development/testing)
5. Isi **App name**: `EcoReward`
6. Isi **User support email** dengan email kamu
7. Di bagian **Developer contact information**, isi dengan email kamu
8. Klik **SAVE AND CONTINUE**
9. Di tab **Scopes**, klik **ADD OR REMOVE SCOPES** lalu tambahkan:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
10. Klik **SAVE AND CONTINUE** → tambahkan email kamu sebagai **Test user** → **SAVE AND CONTINUE**

---

## 2. Web Client ID (untuk Supabase)

Client ID ini digunakan oleh `authService.ts` untuk konfigurasi Google Sign-In dan harus didaftarkan di Supabase Auth.

1. Kembali ke **APIs & Services** → **Credentials**
2. Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Pilih **Application type**: **Web application**
4. Isi **Name**: `EcoReward Web`
5. Di **Authorized redirect URIs**, tambahkan redirect URL dari Supabase:
   ```
   https://<project-id>.supabase.co/auth/v1/callback
   ```
   (Ganti `<project-id>` dengan Project ID Supabase kamu)
6. Klik **CREATE**
7. **Copy Client ID** — ini adalah `webClientId` kamu

### Masukkan ke kode:

Edit `src/services/authService.ts`, ganti placeholder:
```ts
GoogleSignin.configure({
  webClientId: '<PASTE_WEB_CLIENT_ID_HERE>',
});
```

### Masukkan ke Supabase Dashboard:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project → **Authentication** → **Providers**
3. Aktifkan **Google**
4. Paste **Client ID** dan **Client Secret** dari Google Cloud Console

---

## 3. iOS Client ID

### 3a. Buat OAuth Client ID untuk iOS

1. Kembali ke **APIs & Services** → **Credentials**
2. Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Pilih **Application type**: **iOS**
4. Isi **Name**: `EcoReward iOS`
5. Isi **Bundle ID**: `com.ecoreward` (sesuai `PRODUCT_BUNDLE_IDENTIFIER` di Xcode)
6. Klik **CREATE**
7. Download file **GoogleService-Info.plist**

### 3b. Install di Xcode

1. Drag `GoogleService-Info.plist` ke folder `ios/EcoReward/` di Xcode
2. Centang **Copy items if needed** dan pilih **EcoReward** target

### 3c. Tambahkan URL Scheme di Info.plist

Dari file `GoogleService-Info.plist`, cari nilai `REVERSED_CLIENT_ID`. Tambahkan ke `ios/EcoReward/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>com.ecoreward</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>ISI_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### 3d. Edit AppDelegate.mm

Tambahkan Google Sign-In handler di `ios/EcoReward/AppDelegate.mm`:

```objc
#import <GoogleSignIn/GoogleSignIn.h>

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  return [GIDSignIn.sharedInstance handleURL:url];
}
```

### 3e. Run pod install

```bash
cd ios && pod install && cd ..
```

---

## 4. Android Client ID

### 4a. Dapatkan SHA-1 fingerprint

```bash
cd android && ./gradlew signingReport
```

Cari bagian `Variant: debug` → copy nilai `SHA-1`.

### 4b. Buat OAuth Client ID untuk Android

1. Kembali ke **APIs & Services** → **Credentials**
2. Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Pilih **Application type**: **Android**
4. Isi **Name**: `EcoReward Android`
5. Isi **Package name**: `com.ecoreward`
6. Paste **SHA-1** dari langkah 4a
7. Klik **CREATE**
8. Copy **Client ID**

### 4c. Tidak perlu google-services.json

`@react-native-google-signin/google-signin` hanya membutuhkan `webClientId` (dari langkah 2) — tidak perlu `google-services.json` untuk Google Sign-In dasar.

---

## 5. Verifikasi

Setelah semua langkah selesai, test di simulator/device:

```bash
# iOS
yarn ios

# Android
yarn android
```

Klik tombol **"Masuk dengan Google"** di halaman login. Jika muncul popup Google Sign-In, konfigurasi berhasil.

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| `Developer console is not configured` | Pastikan OAuth consent screen sudah lengkap dan ada test user |
| `invalid_client` di iOS | Pastikan `REVERSED_CLIENT_ID` di `Info.plist` + URL scheme sudah benar |
| `Request failed: 10` di Android | SHA-1 fingerprint tidak cocok. Run `signingReport` lagi |
| `Sign in error` di Supabase | Pastikan Google provider sudah aktif di Supabase Dashboard |
