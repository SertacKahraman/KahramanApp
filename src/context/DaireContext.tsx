import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Daire, DaireFormData, KiraArtisi } from '../types';

interface DaireContextType {
  daireler: Daire[];
  kiraArtislari: KiraArtisi[];
  addDaire: (daire: DaireFormData) => Promise<void>;
  updateDaire: (id: string, daire: Partial<Daire>) => Promise<void>;
  deleteDaire: (id: string) => Promise<void>;
  getDaireById: (id: string) => Daire | undefined;
  addKiraArtisi: (daireId: string, eskiTutar: number, yeniTutar: number, gerekce?: string) => Promise<void>;
  getKiraArtislariByDaireId: (daireId: string) => KiraArtisi[];
  getDaireKiraArtisGecmisi: (daireId: string) => KiraArtisi[];
  createBackup: () => Promise<string>;
  restoreBackup: (backupData: string) => Promise<boolean>;
  getLastBackupDate: () => Promise<Date | null>;
}

const DaireContext = createContext<DaireContextType | undefined>(undefined);

export const useDaire = () => {
  const context = useContext(DaireContext);
  if (!context) {
    throw new Error('useDaire must be used within a DaireProvider');
  }
  return context;
};

export const DaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [daireler, setDaireler] = useState<Daire[]>([]);
  const [kiraArtislari, setKiraArtislari] = useState<KiraArtisi[]>([]);

  useEffect(() => {
    loadDaireler();
    loadKiraArtislari();
  }, []);

  const loadDaireler = async () => {
    try {
      const stored = await AsyncStorage.getItem('daireler');
      console.log('AsyncStorage daireler:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed daireler:', parsed);
        // Tarihleri geri parse et
        const dairelerWithDates = parsed.map((daire: any) => ({
          ...daire,
          createdAt: new Date(daire.createdAt),
          updatedAt: new Date(daire.updatedAt),
          kiraBaslangicTarihi: daire.kiraBaslangicTarihi ? new Date(daire.kiraBaslangicTarihi) : new Date(),
          kiraTutari: daire.kiraTutari || undefined,
          kiracıAdi: daire.kiracıAdi || undefined,
          kiracıTelefon: daire.kiracıTelefon || undefined,
          fotoğraflar: daire.fotoğraflar || [],
        }));
        console.log('Daireler with dates:', dairelerWithDates);
        setDaireler(dairelerWithDates);
      } else {
        console.log('No stored daireler found');
      }
    } catch (error) {
      console.error('Daireler yüklenirken hata:', error);
    }
  };

  const saveDaireler = async (newDaireler: Daire[]) => {
    try {
      await AsyncStorage.setItem('daireler', JSON.stringify(newDaireler));
    } catch (error) {
      console.error('Daireler kaydedilirken hata:', error);
    }
  };

  const addDaire = async (daireData: DaireFormData) => {
    const newDaire: Daire = {
      ...daireData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newDaireler = [...daireler, newDaire];
    setDaireler(newDaireler);
    await saveDaireler(newDaireler);
    await autoBackup(); // Otomatik yedekleme
  };

  const updateDaire = async (id: string, updates: Partial<Daire>) => {
    const newDaireler = daireler.map(daire =>
      daire.id === id
        ? { ...daire, ...updates, updatedAt: new Date() }
        : daire
    );
    setDaireler(newDaireler);
    await saveDaireler(newDaireler);
    await autoBackup(); // Otomatik yedekleme
  };

  const deleteDaire = async (id: string) => {
    const newDaireler = daireler.filter(daire => daire.id !== id);
    setDaireler(newDaireler);
    await saveDaireler(newDaireler);
    await autoBackup(); // Otomatik yedekleme
  };

  const getDaireById = (id: string) => {
    return daireler.find(daire => daire.id === id);
  };

  const loadKiraArtislari = async () => {
    try {
      const stored = await AsyncStorage.getItem('kiraArtislari');
      if (stored) {
        const parsed = JSON.parse(stored);
        const kiraArtislariWithDates = parsed.map((artis: any) => ({
          ...artis,
          artisTarihi: new Date(artis.artisTarihi),
          createdAt: new Date(artis.createdAt),
        }));
        setKiraArtislari(kiraArtislariWithDates);
      }
    } catch (error) {
      console.error('Kira artışları yüklenirken hata:', error);
    }
  };

  const saveKiraArtislari = async (newKiraArtislari: KiraArtisi[]) => {
    try {
      await AsyncStorage.setItem('kiraArtislari', JSON.stringify(newKiraArtislari));
    } catch (error) {
      console.error('Kira artışları kaydedilirken hata:', error);
    }
  };

  const addKiraArtisi = async (daireId: string, eskiTutar: number, yeniTutar: number, gerekce?: string) => {
    const artisOrani = ((yeniTutar - eskiTutar) / eskiTutar) * 100;
    const yeniKiraArtisi: KiraArtisi = {
      id: Date.now().toString(),
      daireId,
      eskiTutar,
      yeniTutar,
      artisOrani,
      artisTarihi: new Date(),
      gerekce,
      createdAt: new Date(),
    };

    const newKiraArtislari = [...kiraArtislari, yeniKiraArtisi];
    setKiraArtislari(newKiraArtislari);
    await saveKiraArtislari(newKiraArtislari);

    // Daire bilgilerini güncelle
    await updateDaire(daireId, {
      kiraTutari: yeniTutar,
      sonKiraArtisTarihi: new Date(),
    });
    
    await autoBackup(); // Otomatik yedekleme
  };

  const getKiraArtislariByDaireId = (daireId: string) => {
    return kiraArtislari.filter(artis => artis.daireId === daireId);
  };

  const getDaireKiraArtisGecmisi = (daireId: string) => {
    return kiraArtislari
      .filter(artis => artis.daireId === daireId)
      .sort((a, b) => b.artisTarihi.getTime() - a.artisTarihi.getTime());
  };

  // Otomatik yedekleme fonksiyonları
  const createBackup = async (): Promise<string> => {
    try {
      const backupData = {
        daireler,
        kiraArtislari,
        backupDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const backupString = JSON.stringify(backupData);
      await AsyncStorage.setItem('lastBackup', backupString);
      await AsyncStorage.setItem('lastBackupDate', new Date().toISOString());
      
      console.log('Yedekleme başarılı:', new Date().toLocaleString());
      return backupString;
    } catch (error) {
      console.error('Yedekleme hatası:', error);
      throw error;
    }
  };

  const restoreBackup = async (backupData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(backupData);
      
      if (parsed.daireler && parsed.kiraArtislari) {
        // Tarihleri geri parse et
        const dairelerWithDates = parsed.daireler.map((daire: any) => ({
          ...daire,
          createdAt: new Date(daire.createdAt),
          updatedAt: new Date(daire.updatedAt),
          kiraBaslangicTarihi: daire.kiraBaslangicTarihi ? new Date(daire.kiraBaslangicTarihi) : new Date(),
        }));

        const kiraArtislariWithDates = parsed.kiraArtislari.map((artis: any) => ({
          ...artis,
          artisTarihi: new Date(artis.artisTarihi),
          createdAt: new Date(artis.createdAt),
        }));

        setDaireler(dairelerWithDates);
        setKiraArtislari(kiraArtislariWithDates);
        
        await saveDaireler(dairelerWithDates);
        await saveKiraArtislari(kiraArtislariWithDates);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Geri yükleme hatası:', error);
      return false;
    }
  };

  const getLastBackupDate = async (): Promise<Date | null> => {
    try {
      const lastBackupDate = await AsyncStorage.getItem('lastBackupDate');
      return lastBackupDate ? new Date(lastBackupDate) : null;
    } catch (error) {
      console.error('Son yedekleme tarihi alınırken hata:', error);
      return null;
    }
  };

  // Otomatik yedekleme - her veri değişikliğinde
  const autoBackup = async () => {
    try {
      await createBackup();
    } catch (error) {
      console.error('Otomatik yedekleme hatası:', error);
    }
  };

  const value: DaireContextType = {
    daireler,
    kiraArtislari,
    addDaire,
    updateDaire,
    deleteDaire,
    getDaireById,
    addKiraArtisi,
    getKiraArtislariByDaireId,
    getDaireKiraArtisGecmisi,
    createBackup,
    restoreBackup,
    getLastBackupDate,
  };

  return (
    <DaireContext.Provider value={value}>
      {children}
    </DaireContext.Provider>
  );
};

