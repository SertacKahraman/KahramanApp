import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useDaire } from '../context/DaireContext';
import { RootStackParamList, Daire } from '../types';
import DaireCard from '../components/DaireCard';
import * as Clipboard from 'expo-clipboard';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { daireler, deleteDaire, createBackup, restoreBackup, getLastBackupDate } = useDaire();
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);

  const handleDairePress = (daire: Daire) => {
    navigation.navigate('DaireDetail', { daireId: daire.id });
  };



  const handleDeleteDaire = (daire: Daire) => {
    Alert.alert(
      'Daireyi Sil',
      `${daire.ad} dairesini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteDaire(daire.id),
        },
      ]
    );
  };

  const handleCreateBackup = async () => {
    try {
      const backupData = await createBackup();
      await Clipboard.setStringAsync(backupData);
      Alert.alert(
        'Yedekleme Başarılı!',
        'Tüm daire verileri yedeklendi ve panoya kopyalandı. Bu kodu annenizin telefonuna gönderin.',
        [{ text: 'Tamam' }]
      );
      setLastBackupDate(new Date());
    } catch (error) {
      Alert.alert('Hata', 'Yedekleme yapılırken bir hata oluştu.');
    }
  };

  const handleRestoreBackup = () => {
    Alert.prompt(
      'Yedek Geri Yükle',
      'Yedek kodunu yapıştırın:',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Geri Yükle',
          onPress: async (backupData) => {
            if (backupData) {
              try {
                const success = await restoreBackup(backupData);
                if (success) {
                  Alert.alert('Başarılı', 'Tüm daire verileri geri yüklendi!');
                  setLastBackupDate(new Date());
                } else {
                  Alert.alert('Hata', 'Yedek verisi geçersiz.');
                }
              } catch (error) {
                Alert.alert('Hata', 'Geri yükleme sırasında bir hata oluştu.');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Son yedekleme tarihini yükle
  useEffect(() => {
    const loadLastBackupDate = async () => {
      const date = await getLastBackupDate();
      setLastBackupDate(date);
    };
    loadLastBackupDate();
  }, [getLastBackupDate]);

  const renderDaire = ({ item }: { item: Daire }) => (
    <DaireCard
      daire={item}
      onPress={() => handleDairePress(item)}
      onDelete={() => handleDeleteDaire(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kahraman</Text>
        <Text style={styles.subtitle}>
          Toplam {daireler.length} daire
        </Text>
      </View>
      
      {daireler.length > 0 && (
        <View style={styles.backupBar}>
          <TouchableOpacity style={styles.backupButton} onPress={handleCreateBackup}>
            <Ionicons name="cloud-upload" size={16} color="#666" />
            <Text style={styles.backupButtonText}>Yedekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestoreBackup}>
            <Ionicons name="cloud-download" size={16} color="#666" />
            <Text style={styles.restoreButtonText}>Geri Yükle</Text>
          </TouchableOpacity>
          
          {lastBackupDate && (
            <Text style={styles.lastBackupText}>
              Son: {lastBackupDate.toLocaleDateString('tr-TR')}
            </Text>
          )}
        </View>
      )}

      {daireler.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Henüz daire eklenmemiş</Text>
          <Text style={styles.emptySubtext}>
            İlk dairenizi eklemek için aşağıdaki butona tıklayın
          </Text>
        </View>
      ) : (
        <FlatList
          data={daireler}
          renderItem={renderDaire}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  backupBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e3f2fd',
  },
  backupButtonText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e8f5e8',
  },
  restoreButtonText: {
    color: '#388e3c',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  lastBackupText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

