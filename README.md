# Daire Takip Uygulaması

Bu uygulama, sizin ve annenizin kullanacağı, 13 dairenin bilgilerini kolayca yönetebileceğiniz bir mobil uygulamadır.

## Özellikler

- **Daire Yönetimi**: 13 dairenin bilgilerini ekleme, düzenleme ve silme
- **Fatura Takibi**: Her daire için su, elektrik, doğalgaz ve DASK numaralarını saklama
- **Kolay Erişim**: Daire bilgilerine hızlıca erişim
- **Notlar**: Her daire için ek notlar ekleme
- **Modern Arayüz**: Kullanıcı dostu ve güzel tasarım
- **Veri Saklama**: AsyncStorage ile verileri cihazda saklama

## Kurulum

### Web Versiyonu (Önerilen)
1. **index.html** dosyasını herhangi bir web tarayıcısında açın
2. Uygulama hemen kullanıma hazır olacaktır
3. Veriler tarayıcınızın localStorage'ında saklanır

### Mobil Versiyonu
1. **Node.js Kurulumu**: Önce [Node.js](https://nodejs.org/) kurun
2. **Expo CLI Kurulumu**: `npm install -g @expo/cli`
3. **Bağımlılıkları Yükleyin**: `npm install`
4. **Uygulamayı Başlatın**: `npm start`

## Kullanım

### Ana Ekran
- Tüm dairelerin listesi görüntülenir
- Sağ alt köşedeki + butonu ile yeni daire eklenebilir
- Her daire kartına tıklayarak detayları görüntülenebilir

### Daire Ekleme
- Daire adı ve adresi zorunludur
- Su, elektrik, doğalgaz ve DASK numaraları eklenebilir
- Opsiyonel notlar eklenebilir

### Daire Detayı
- Daire bilgileri detaylı olarak görüntülenir
- Düzenleme butonu ile bilgiler güncellenebilir
- Silme butonu ile daire kaldırılabilir

## Teknik Detaylar

- **Framework**: React Native + Expo
- **Dil**: TypeScript
- **Navigasyon**: React Navigation
- **Veri Saklama**: AsyncStorage
- **İkonlar**: Expo Vector Icons

## Ekran Görüntüleri

Uygulama şu ekranları içerir:
1. **Ana Ekran**: Daire listesi
2. **Daire Ekleme**: Yeni daire formu
3. **Daire Detayı**: Daire bilgileri ve düzenleme

## Geliştirme

Bu uygulama özellikle sizin ve annenizin ihtiyaçları için tasarlanmıştır. 13 dairenin bilgilerini kolayca yönetebilir, su, elektrik, doğalgaz ve DASK numaralarına hızlıca erişebilirsiniz.

## Lisans

Bu proje kişisel kullanım için geliştirilmiştir.
