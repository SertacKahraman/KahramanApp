import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabParamList, RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDaire } from '../context/DaireContext';
import { DaireFormData } from '../types';

type AddDaireScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'AddDaire'>,
  BottomTabNavigationProp<TabParamList>
>;

export default function AddDaireScreen() {
  const navigation = useNavigation<AddDaireScreenNavigationProp>();
  const { addDaire } = useDaire();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<DaireFormData>({
    ad: '',
    adres: '',
    suNumarasi: '',
    elektrikNumarasi: '',
    dogalgazNumarasi: '',
    daskNumarasi: '',
    depozitoDurumu: 'belirsiz',
    depozitoTutari: undefined,
    kiraBaslangicTarihi: new Date(),
    kiraTutari: undefined,
    kiracıAdi: '',
    kiracıTelefon: '',
    dolulukDurumu: 'bos',
    fotoğraflar: [],
    notlar: '',
  });

  const handleInputChange = (field: keyof DaireFormData, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newFotoğraflar = [...(formData.fotoğraflar || []), result.assets[0].uri];
        setFormData(prev => ({ ...prev, fotoğraflar: newFotoğraflar }));
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const removeImage = (index: number) => {
    const newFotoğraflar = formData.fotoğraflar?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, fotoğraflar: newFotoğraflar }));
  };

  const handleSubmit = async () => {
    // Basit validasyon
    if (!formData.ad.trim() || !formData.adres.trim()) {
      Alert.alert('Hata', 'Lütfen daire adı ve adresini doldurun.');
      return;
    }

    await addDaire(formData);
    Alert.alert(
      'Başarılı',
      'Daire başarıyla eklendi!',
      [
        {
          text: 'Tamam',
          onPress: () => {
            // Daireler tab'ına dön
            navigation.navigate('Daireler');
          },
        },
      ]
    );
  };

  const isFormValid = formData.ad.trim() && formData.adres.trim();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('kiraBaslangicTarihi', selectedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daire Adı *</Text>
              <TextInput
                style={styles.input}
                value={formData.ad}
                onChangeText={(value) => handleInputChange('ad', value)}
                placeholder="Örn: A Blok Daire 1"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.adres}
                onChangeText={(value) => handleInputChange('adres', value)}
                placeholder="Daire adresini girin"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fatura Numaraları</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Su Numarası</Text>
              <TextInput
                style={styles.input}
                value={formData.suNumarasi}
                onChangeText={(value) => handleInputChange('suNumarasi', value)}
                placeholder="Su sayacı numarası"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elektrik Numarası</Text>
              <TextInput
                style={styles.input}
                value={formData.elektrikNumarasi}
                onChangeText={(value) => handleInputChange('elektrikNumarasi', value)}
                placeholder="Elektrik sayacı numarası"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doğalgaz Numarası</Text>
              <TextInput
                style={styles.input}
                value={formData.dogalgazNumarasi}
                onChangeText={(value) => handleInputChange('dogalgazNumarasi', value)}
                placeholder="Doğalgaz sayacı numarası"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DASK Numarası</Text>
              <TextInput
                style={styles.input}
                value={formData.daskNumarasi}
                onChangeText={(value) => handleInputChange('daskNumarasi', value)}
                placeholder="DASK sigorta numarası"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kira ve Depozito Bilgileri</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Depozito Durumu</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.depozitoDurumu === 'var' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('depozitoDurumu', 'var')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.depozitoDurumu === 'var' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Var</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.depozitoDurumu === 'yok' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('depozitoDurumu', 'yok')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.depozitoDurumu === 'yok' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Yok</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.depozitoDurumu === 'belirsiz' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('depozitoDurumu', 'belirsiz')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.depozitoDurumu === 'belirsiz' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Belirsiz</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.depozitoDurumu === 'var' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Depozito Tutarı (TL)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.depozitoTutari?.toString() || ''}
                  onChangeText={(value) => handleInputChange('depozitoTutari', parseFloat(value) || 0)}
                  placeholder="Depozito tutarını girin"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kira Başlangıç Tarihi</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showDatePickerModal}
              >
                <Text style={styles.dateInputText}>
                  {formData.kiraBaslangicTarihi.toLocaleDateString('tr-TR')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kira Tutarı (TL)</Text>
              <TextInput
                style={styles.input}
                value={formData.kiraTutari?.toString() || ''}
                onChangeText={(value) => handleInputChange('kiraTutari', parseFloat(value) || 0)}
                placeholder="Aylık kira tutarını girin"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kiracı Bilgileri</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doluluk Durumu</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.dolulukDurumu === 'dolu' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('dolulukDurumu', 'dolu')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.dolulukDurumu === 'dolu' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Dolu</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.dolulukDurumu === 'bos' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleInputChange('dolulukDurumu', 'bos')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.dolulukDurumu === 'bos' && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>Boş</Text>
                </TouchableOpacity>
                

              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kiracı Adı</Text>
              <TextInput
                style={styles.input}
                value={formData.kiracıAdi}
                onChangeText={(value) => handleInputChange('kiracıAdi', value)}
                placeholder="Kiracının adı ve soyadı"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kiracı Telefon</Text>
              <TextInput
                style={styles.input}
                value={formData.kiracıTelefon}
                onChangeText={(value) => handleInputChange('kiracıTelefon', value)}
                placeholder="Kiracının telefon numarası"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotoğraflar</Text>
            
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color="#2196F3" />
              <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>

            {formData.fotoğraflar && formData.fotoğraflar.length > 0 && (
              <View style={styles.photoGrid}>
                {formData.fotoğraflar.map((uri, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri }} style={styles.photo} />
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ek Bilgiler</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notlar}
                onChangeText={(value) => handleInputChange('notlar', value)}
                placeholder="Ek notlar ekleyin (opsiyonel)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.submitButtonText}>Daireyi Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.kiraBaslangicTarihi}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 100, // Klavye için extra padding
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    width: '30%', // 3 fotoğraf için 30% genişlik
    aspectRatio: 1, // Kare şeklinde container
    margin: 4,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

