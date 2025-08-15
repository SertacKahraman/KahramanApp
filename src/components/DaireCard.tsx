import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Daire } from '../types';

interface DaireCardProps {
  daire: Daire;
  onPress: () => void;
  onDelete: () => void;
}

export default function DaireCard({ daire, onPress, onDelete }: DaireCardProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

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
    console.log('Opening image modal for:', imageUri);
    setSelectedImage(imageUri);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="home" size={20} color="#2196F3" />
            <Text style={styles.title}>{daire.ad}</Text>
            <View style={[
              styles.statusBadge,
              daire.dolulukDurumu === 'dolu' && styles.statusDolu,
              daire.dolulukDurumu === 'bos' && styles.statusBos
            ]}>
              <Text style={styles.statusText}>
                {daire.dolulukDurumu === 'dolu' ? 'Dolu' : 'Boş'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>

        <Text style={styles.address}>{daire.adres}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="water-outline" size={16} color="#00BCD4" />
            <Text style={styles.infoLabel}>Su</Text>
            <Text style={styles.infoValue}>{daire.suNumarasi}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="flash-outline" size={16} color="#FFC107" />
            <Text style={styles.infoLabel}>Elektrik</Text>
            <Text style={styles.infoValue}>{daire.elektrikNumarasi}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={16} color="#FF5722" />
            <Text style={styles.infoLabel}>Doğalgaz</Text>
            <Text style={styles.infoValue}>{daire.dogalgazNumarasi}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="shield-outline" size={16} color="#4CAF50" />
            <Text style={styles.infoLabel}>DASK</Text>
            <Text style={styles.infoValue}>{daire.daskNumarasi}</Text>
          </View>
        </View>

        <View style={styles.rentalInfo}>
          <View style={styles.rentalItem}>
            <Ionicons name="calendar-outline" size={16} color="#9C27B0" />
            <Text style={styles.rentalLabel}>Kira Başlangıç:</Text>
            <Text style={styles.rentalValue}>
              {daire.kiraBaslangicTarihi.toLocaleDateString('tr-TR')}
            </Text>
          </View>
          
          <View style={styles.rentalItem}>
            <Ionicons name="wallet-outline" size={16} color="#FF9800" />
            <Text style={styles.rentalLabel}>Depozito:</Text>
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

        {daire.kiraTutari && (
          <View style={styles.rentalInfo}>
            <View style={styles.rentalItem}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={styles.rentalLabel}>Kira Tutarı:</Text>
              <Text style={[styles.rentalValue, styles.rentAmount]}>
                {daire.kiraTutari} TL
              </Text>
            </View>
          </View>
        )}

        {(daire.kiracıAdi || daire.kiracıTelefon) && (
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantTitle}>Kiracı Bilgileri</Text>
            {daire.kiracıAdi && (
              <View style={styles.tenantItem}>
                <Ionicons name="person-outline" size={16} color="#E91E63" />
                <Text style={styles.tenantLabel}>Ad:</Text>
                <Text style={styles.tenantValue}>{daire.kiracıAdi}</Text>
              </View>
            )}
            {daire.kiracıTelefon && (
              <View style={styles.tenantItem}>
                <Ionicons name="call-outline" size={16} color="#E91E63" />
                <Text style={styles.tenantLabel}>Tel:</Text>
                <Text style={styles.tenantValue}>{daire.kiracıTelefon}</Text>
              </View>
            )}
          </View>
        )}

        {daire.fotoğraflar && daire.fotoğraflar.length > 0 && (
          <View style={styles.photoSection}>
            <Text style={styles.photoTitle}>Fotoğraflar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {daire.fotoğraflar.map((uri, index) => (
                <TouchableOpacity key={index} onPress={() => openImageModal(uri)}>
                  <Image source={{ uri }} style={styles.photoThumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {daire.notlar && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notlar:</Text>
            <Text style={styles.notesText}>{daire.notlar}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.dateText}>
            Son güncelleme: {daire.updatedAt.toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Fotoğraf Görüntüleme Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          animationType="slide"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => {
                console.log('Background pressed');
                setSelectedImage(null);
              }}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Close button pressed');
                setSelectedImage(null);
              }}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <Image source={{ uri: selectedImage }} style={styles.modalImage} />
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => saveImageToGallery(selectedImage!)}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    marginRight: 8,
    minWidth: 50,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  rentalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rentalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentalLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  rentalValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  depositYes: {
    color: '#4CAF50',
  },
  depositNo: {
    color: '#f44336',
  },
  depositUnknown: {
    color: '#FFC107',
  },
  tenantInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tenantTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  tenantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tenantLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  tenantValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  rentAmount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  photoThumbnail: {
    width: 80,
    height: 80, // Kare şeklinde
    borderRadius: 4,
    marginRight: 8,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)', // Sadece modal içeriğini etkilemek için
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 15,
    zIndex: 1000,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDolu: {
    backgroundColor: '#4CAF50',
  },
  statusBos: {
    backgroundColor: '#FF9800',
  },
  statusBelirsiz: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});

