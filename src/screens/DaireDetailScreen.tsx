import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDaire } from '../context/DaireContext';
import { RootStackParamList, Daire } from '../types';

type DaireDetailRouteProp = RouteProp<RootStackParamList, 'DaireDetail'>;

export default function DaireDetailScreen() {
  const route = useRoute<DaireDetailRouteProp>();
  const navigation = useNavigation();
  const { getDaireById, updateDaire, deleteDaire, addKiraArtisi, getDaireKiraArtisGecmisi } = useDaire();
  const { daireId } = route.params;
  
  const daire = getDaireById(daireId);
  const kiraArtisGecmisi = daire ? getDaireKiraArtisGecmisi(daireId) : [];
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Daire>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showKiraArtisiModal, setShowKiraArtisiModal] = useState(false);
  const [showKiraArtisiGecmisi, setShowKiraArtisiGecmisi] = useState(false);
  const [newKiraTutari, setNewKiraTutari] = useState('');
  const [kiraArtisGerekcesi, setKiraArtisGerekcesi] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const saveImageToGallery = async (imageUri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğrafı kaydetmek için galeri izni gerekiyor.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Başarılı', 'Fotoğraf galeriye kaydedildi!');
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf kaydedilirken bir hata oluştu.');
    }
  };

  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newFotoğraflar = [...(editData.fotoğraflar || []), result.assets[0].uri];
        setEditData(prev => ({ ...prev, fotoğraflar: newFotoğraflar }));
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const removeImage = (index: number) => {
    const newFotoğraflar = editData.fotoğraflar?.filter((_, i) => i !== index) || [];
    setEditData(prev => ({ ...prev, fotoğraflar: newFotoğraflar }));
  };

  // Kopyalama fonksiyonu
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Kopyalandı', `${label} panoya kopyalandı!`);
    } catch (error) {
      Alert.alert('Hata', 'Kopyalama işlemi başarısız oldu.');
    }
  };

  // Arama fonksiyonu
  const makePhoneCall = async (phoneNumber: string) => {
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Telefon arama özelliği desteklenmiyor.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Arama yapılırken bir hata oluştu.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditData(prev => ({ ...prev, kiraBaslangicTarihi: selectedDate }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  if (!daire) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Daire bulunamadı</Text>
      </View>
    );
  }

  const handleEdit = () => {
    setEditData({
      ad: daire.ad,
      adres: daire.adres,
      suNumarasi: daire.suNumarasi,
      elektrikNumarasi: daire.elektrikNumarasi,
      dogalgazNumarasi: daire.dogalgazNumarasi,
      daskNumarasi: daire.daskNumarasi,
      depozitoDurumu: daire.depozitoDurumu,
      depozitoTutari: daire.depozitoTutari,
      kiraBaslangicTarihi: daire.kiraBaslangicTarihi,
      kiraTutari: daire.kiraTutari,
      kiracıAdi: daire.kiracıAdi,
      kiracıTelefon: daire.kiracıTelefon,
      dolulukDurumu: daire.dolulukDurumu,
      fotoğraflar: daire.fotoğraflar,
      notlar: daire.notlar,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateDaire(daireId, editData);
    setIsEditing(false);
    Alert.alert('Başarılı', 'Daire bilgileri güncellendi!');
  };

  const handleKiraArtisiEkle = async () => {
    if (!newKiraTutari || !daire?.kiraTutari) {
      Alert.alert('Hata', 'Lütfen yeni kira tutarını girin.');
      return;
    }

    const yeniTutar = parseFloat(newKiraTutari);
    if (yeniTutar <= daire.kiraTutari) {
      Alert.alert('Hata', 'Yeni kira tutarı mevcut tutardan büyük olmalıdır.');
      return;
    }

    await addKiraArtisi(daireId, daire.kiraTutari, yeniTutar, kiraArtisGerekcesi);
    setShowKiraArtisiModal(false);
    setNewKiraTutari('');
    setKiraArtisGerekcesi('');
    Alert.alert('Başarılı', 'Kira artışı eklendi!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Daireyi Sil',
      `${daire.ad} dairesini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteDaire(daireId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderInfoItem = (icon: string, label: string, value: string, color: string) => (
    <TouchableOpacity 
      style={styles.infoItem}
      onPress={() => value ? copyToClipboard(value, label) : null}
      disabled={!value}
    >
      <View style={styles.infoHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.infoLabel}>{label}</Text>
        {value && <Ionicons name="copy-outline" size={16} color="#666" style={styles.copyIcon} />}
      </View>
      <Text style={styles.infoValue}>
        {value || 'Belirtilmemiş'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="home" size={32} color="#2196F3" />
            <Text style={styles.title}>{daire.ad}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Adres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adres</Text>
          <Text style={styles.address}>{daire.adres}</Text>
        </View>

        {/* Fatura Numaraları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fatura Numaraları</Text>
          {renderInfoItem('water-outline', 'Su Numarası', daire.suNumarasi, '#00BCD4')}
          {renderInfoItem('flash-outline', 'Elektrik Numarası', daire.elektrikNumarasi, '#FFC107')}
          {renderInfoItem('flame-outline', 'Doğalgaz Numarası', daire.dogalgazNumarasi, '#FF5722')}
          {renderInfoItem('shield-outline', 'DASK Numarası', daire.daskNumarasi, '#4CAF50')}
        </View>

        {/* Kira ve Depozito Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kira ve Depozito Bilgileri</Text>
          
          <View style={styles.rentalItem}>
            <View style={styles.rentalHeader}>
              <Ionicons name="calendar-outline" size={20} color="#9C27B0" />
              <Text style={styles.rentalLabel}>Kira Başlangıç Tarihi</Text>
            </View>
            <Text style={styles.rentalValue}>
              {daire.kiraBaslangicTarihi.toLocaleDateString('tr-TR')}
            </Text>
          </View>
          
          {daire.kiraTutari && (
            <View style={styles.rentalItem}>
              <View style={styles.rentalHeader}>
                <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                <Text style={styles.rentalLabel}>Kira Tutarı</Text>
              </View>
              <Text style={[styles.rentalValue, styles.rentAmount]}>
                {daire.kiraTutari} TL
              </Text>
            </View>
          )}
          
          <View style={styles.rentalItem}>
            <View style={styles.rentalHeader}>
              <Ionicons name="wallet-outline" size={20} color="#FF9800" />
              <Text style={styles.rentalLabel}>Depozito Durumu</Text>
            </View>
            <Text style={[
              styles.rentalValue,
              daire.depozitoDurumu === 'var' && styles.depositYes,
              daire.depozitoDurumu === 'yok' && styles.depositNo,
              daire.depozitoDurumu === 'belirsiz' && styles.depositUnknown
            ]}>
              {daire.depozitoDurumu === 'var' && daire.depozitoTutari 
                ? `${daire.depozitoTutari} TL`
                : daire.depozitoDurumu === 'var' 
                  ? 'Var (Tutar belirtilmemiş)'
                  : daire.depozitoDurumu === 'yok' 
                    ? 'Yok'
                    : 'Belirsiz'
              }
            </Text>
          </View>
        </View>

        {/* Kiracı Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kiracı Bilgileri</Text>
          
          <View style={styles.tenantItem}>
            <View style={styles.tenantHeader}>
              <Ionicons name="home-outline" size={20} color="#2196F3" />
              <Text style={styles.tenantLabel}>Doluluk Durumu</Text>
            </View>
            <Text style={[
              styles.tenantValue,
              daire.dolulukDurumu === 'dolu' && styles.statusDolu,
              daire.dolulukDurumu === 'bos' && styles.statusBos
            ]}>
              {daire.dolulukDurumu === 'dolu' ? 'Dolu' : 'Boş'}
            </Text>
          </View>
          
          {daire.kiracıAdi && (
            <View style={styles.tenantItem}>
              <View style={styles.tenantHeader}>
                <Ionicons name="person-outline" size={20} color="#E91E63" />
                <Text style={styles.tenantLabel}>Kiracı Adı</Text>
              </View>
              <Text style={styles.tenantValue}>{daire.kiracıAdi}</Text>
            </View>
          )}
          
          {daire.kiracıTelefon && (
            <TouchableOpacity 
              style={styles.tenantItem}
              onPress={() => makePhoneCall(daire.kiracıTelefon!)}
            >
              <View style={styles.tenantHeader}>
                <Ionicons name="call-outline" size={20} color="#E91E63" />
                <Text style={styles.tenantLabel}>Telefon Numarası</Text>
                <Ionicons name="call" size={16} color="#E91E63" style={styles.callIcon} />
              </View>
              <Text style={styles.tenantValue}>{daire.kiracıTelefon}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Kira Artış Takibi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kira Artış Takibi</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowKiraArtisiModal(true)}
            >
              <Ionicons name="add" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {daire.sonKiraArtisTarihi && (
            <View style={styles.rentalItem}>
              <View style={styles.rentalHeader}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
                <Text style={styles.rentalLabel}>Son Kira Artışı</Text>
              </View>
              <Text style={styles.rentalValue}>
                {daire.sonKiraArtisTarihi.toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}

          {daire.gelecekKiraArtisTarihi && (
            <View style={styles.rentalItem}>
              <View style={styles.rentalHeader}>
                <Ionicons name="calendar" size={20} color="#FF9800" />
                <Text style={styles.rentalLabel}>Gelecek Kira Artışı</Text>
              </View>
              <Text style={styles.rentalValue}>
                {daire.gelecekKiraArtisTarihi.toLocaleDateString('tr-TR')}
                {daire.beklenenKiraArtisOrani && ` (%${daire.beklenenKiraArtisOrani})`}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => setShowKiraArtisiGecmisi(true)}
          >
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.historyButtonText}>Kira Artış Geçmişi</Text>
          </TouchableOpacity>
        </View>

        {/* Fotoğraflar */}
        {daire.fotoğraflar && daire.fotoğraflar.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotoğraflar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {daire.fotoğraflar.map((uri, index) => (
                <TouchableOpacity key={index} onPress={() => openImageModal(uri)}>
                  <Image source={{ uri }} style={styles.photo} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Notlar */}
        {daire.notlar && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <Text style={styles.notes}>{daire.notlar}</Text>
          </View>
        )}

        {/* Tarih Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih Bilgileri</Text>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Oluşturulma:</Text>
            <Text style={styles.dateValue}>
              {daire.createdAt.toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Son Güncelleme:</Text>
            <Text style={styles.dateValue}>
              {daire.updatedAt.toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Düzenleme Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="create-outline" size={24} color="#2196F3" />
              <Text style={styles.modalTitle}>Daire Bilgilerini Düzenle</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsEditing(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daire Adı</Text>
              <TextInput
                style={styles.input}
                value={editData.ad}
                onChangeText={(value) => setEditData(prev => ({ ...prev, ad: value }))}
                placeholder="Daire adı"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.adres}
                onChangeText={(value) => setEditData(prev => ({ ...prev, adres: value }))}
                placeholder="Adres"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Su Numarası</Text>
              <TextInput
                style={styles.input}
                value={editData.suNumarasi}
                onChangeText={(value) => setEditData(prev => ({ ...prev, suNumarasi: value }))}
                placeholder="Su numarası"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elektrik Numarası</Text>
              <TextInput
                style={styles.input}
                value={editData.elektrikNumarasi}
                onChangeText={(value) => setEditData(prev => ({ ...prev, elektrikNumarasi: value }))}
                placeholder="Elektrik numarası"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doğalgaz Numarası</Text>
              <TextInput
                style={styles.input}
                value={editData.dogalgazNumarasi}
                onChangeText={(value) => setEditData(prev => ({ ...prev, dogalgazNumarasi: value }))}
                placeholder="Doğalgaz numarası"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DASK Numarası</Text>
              <TextInput
                style={styles.input}
                value={editData.daskNumarasi}
                onChangeText={(value) => setEditData(prev => ({ ...prev, daskNumarasi: value }))}
                placeholder="DASK numarası"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kira Başlangıç Tarihi</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showDatePickerModal}
              >
                <Text style={styles.dateInputText}>
                  {editData.kiraBaslangicTarihi ? editData.kiraBaslangicTarihi.toLocaleDateString('tr-TR') : 'Tarih seçin'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kira Tutarı (TL)</Text>
              <TextInput
                style={styles.input}
                value={editData.kiraTutari?.toString() || ''}
                onChangeText={(value) => setEditData(prev => ({ ...prev, kiraTutari: parseFloat(value) || 0 }))}
                placeholder="Kira tutarını girin"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Depozito Durumu</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    editData.depozitoDurumu === 'var' && styles.radioButtonSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, depozitoDurumu: 'var' }))}
                >
                  <View style={[
                    styles.radioCircle,
                    editData.depozitoDurumu === 'var' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Var</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    editData.depozitoDurumu === 'yok' && styles.radioButtonSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, depozitoDurumu: 'yok' }))}
                >
                  <View style={[
                    styles.radioCircle,
                    editData.depozitoDurumu === 'yok' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Yok</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    editData.depozitoDurumu === 'belirsiz' && styles.radioButtonSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, depozitoDurumu: 'belirsiz' }))}
                >
                  <View style={[
                    styles.radioCircle,
                    editData.depozitoDurumu === 'belirsiz' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Belirsiz</Text>
                </TouchableOpacity>
              </View>
            </View>

            {editData.depozitoDurumu === 'var' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Depozito Tutarı (TL)</Text>
                <TextInput
                  style={styles.input}
                  value={editData.depozitoTutari?.toString() || ''}
                  onChangeText={(value) => setEditData(prev => ({ ...prev, depozitoTutari: parseFloat(value) || 0 }))}
                  placeholder="Depozito tutarını girin"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doluluk Durumu</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    editData.dolulukDurumu === 'dolu' && styles.radioButtonSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, dolulukDurumu: 'dolu' }))}
                >
                  <View style={[
                    styles.radioCircle,
                    editData.dolulukDurumu === 'dolu' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Dolu</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    editData.dolulukDurumu === 'bos' && styles.radioButtonSelected
                  ]}
                  onPress={() => setEditData(prev => ({ ...prev, dolulukDurumu: 'bos' }))}
                >
                  <View style={[
                    styles.radioCircle,
                    editData.dolulukDurumu === 'bos' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Boş</Text>
                </TouchableOpacity>
                

              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kiracı Adı</Text>
              <TextInput
                style={styles.input}
                value={editData.kiracıAdi}
                onChangeText={(value) => setEditData(prev => ({ ...prev, kiracıAdi: value }))}
                placeholder="Kiracı adı"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kiracı Telefon Numarası</Text>
              <TextInput
                style={styles.input}
                value={editData.kiracıTelefon}
                onChangeText={(value) => setEditData(prev => ({ ...prev, kiracıTelefon: value }))}
                placeholder="Kiracı telefon numarası"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fotoğraflar</Text>
              
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color="#2196F3" />
                <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
              </TouchableOpacity>

              {editData.fotoğraflar && editData.fotoğraflar.length > 0 && (
                <View style={styles.photoGrid}>
                  {editData.fotoğraflar.map((uri, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.editPhoto} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#f44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.notlar}
                onChangeText={(value) => setEditData(prev => ({ ...prev, notlar: value }))}
                placeholder="Notlar"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kira Artış Ekleme Modal */}
      <Modal
        visible={showKiraArtisiModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kira Artışı Ekle</Text>
            <TouchableOpacity onPress={() => setShowKiraArtisiModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mevcut Kira Tutarı (TL)</Text>
                <TextInput
                  style={styles.input}
                  value={daire.kiraTutari?.toString() || ''}
                  editable={false}
                  placeholder="Mevcut kira tutarı"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Kira Tutarı (TL) *</Text>
                <TextInput
                  style={styles.input}
                  value={newKiraTutari}
                  onChangeText={setNewKiraTutari}
                  placeholder="Yeni kira tutarını girin"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Artış Gerekçesi</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={kiraArtisGerekcesi}
                  onChangeText={setKiraArtisGerekcesi}
                  placeholder="Artış gerekçesini yazın (opsiyonel)"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {newKiraTutari && daire.kiraTutari && (
                <View style={styles.artisBilgisi}>
                  <Text style={styles.artisLabel}>Artış Bilgileri:</Text>
                  <Text style={styles.artisText}>
                    Eski Tutar: {daire.kiraTutari.toLocaleString('tr-TR')} ₺
                  </Text>
                  <Text style={styles.artisText}>
                    Yeni Tutar: {parseFloat(newKiraTutari).toLocaleString('tr-TR')} ₺
                  </Text>
                  <Text style={styles.artisText}>
                    Artış Oranı: %{(((parseFloat(newKiraTutari) - daire.kiraTutari) / daire.kiraTutari) * 100).toFixed(1)}
                  </Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowKiraArtisiModal(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !newKiraTutari && styles.saveButtonDisabled]}
              onPress={handleKiraArtisiEkle}
              disabled={!newKiraTutari}
            >
              <Text style={styles.saveButtonText}>Artışı Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kira Artış Geçmişi Modal */}
      <Modal
        visible={showKiraArtisiGecmisi}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kira Artış Geçmişi</Text>
            <TouchableOpacity onPress={() => setShowKiraArtisiGecmisi(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {kiraArtisGecmisi.length > 0 ? (
              kiraArtisGecmisi.map((artis, index) => (
                <View key={artis.id} style={styles.artisGecmisiItem}>
                  <View style={styles.artisGecmisiHeader}>
                    <Text style={styles.artisGecmisiTarih}>
                      {artis.artisTarihi.toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.artisGecmisiOran}>
                      %{artis.artisOrani.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.artisGecmisiDetay}>
                    <Text style={styles.artisGecmisiText}>
                      {artis.eskiTutar.toLocaleString('tr-TR')} ₺ → {artis.yeniTutar.toLocaleString('tr-TR')} ₺
                    </Text>
                    {artis.gerekce && (
                      <Text style={styles.artisGecmisiGerekce}>
                        Gerekçe: {artis.gerekce}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trending-up-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Henüz kira artışı yapılmamış</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Fotoğraf Görüntüleme Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          animationType="slide"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.photoModalContent}>
            <TouchableOpacity
              style={styles.closePhotoButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <Image source={{ uri: selectedImage }} style={styles.photoModalImage} />
            
            <TouchableOpacity
              style={styles.savePhotoButton}
              onPress={() => saveImageToGallery(selectedImage!)}
            >
              <Ionicons name="download-outline" size={24} color="white" />
              <Text style={styles.savePhotoText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={editData.kiraBaslangicTarihi || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  address: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  infoItem: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 28,
  },
  copyIcon: {
    marginLeft: 'auto',
  },
  clickableValue: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  callIcon: {
    marginLeft: 'auto',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  notes: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalScrollContent: {
    paddingBottom: 150, // Klavye için extra padding
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  modalFooter: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    marginLeft: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rentalItem: {
    marginBottom: 16,
  },
  rentalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rentalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  rentalValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 28,
  },
  rentAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  depositYes: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  depositNo: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  depositUnknown: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginRight: 8,
  },
  radioCircleSelected: {
    backgroundColor: '#2196F3',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  tenantItem: {
    marginBottom: 16,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tenantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tenantValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 28,
  },
  photo: {
    width: 100,
    height: 100, // Kare şeklinde
    borderRadius: 8,
    marginRight: 10,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  addPhotoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  photoContainer: {
    position: 'relative',
    margin: 5,
  },
  editPhoto: {
    width: 100,
    height: 100, // Kare şeklinde
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  photoModalContent: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePhotoButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  photoModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  savePhotoButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePhotoText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  statusDolu: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusBos: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusBelirsiz: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 12,
  },
  historyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  artisBilgisi: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  artisLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  artisText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  artisGecmisiItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  artisGecmisiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  artisGecmisiTarih: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  artisGecmisiOran: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  artisGecmisiDetay: {
    marginTop: 8,
  },
  artisGecmisiText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  artisGecmisiGerekce: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

