export interface KiraArtisi {
  id: string;
  daireId: string;
  eskiTutar: number;
  yeniTutar: number;
  artisOrani: number;
  artisTarihi: Date;
  gerekce?: string;
  createdAt: Date;
}

export interface Daire {
  id: string;
  ad: string;
  adres: string;
  suNumarasi: string;
  elektrikNumarasi: string;
  dogalgazNumarasi: string;
  daskNumarasi: string;
  depozitoDurumu: 'var' | 'yok' | 'belirsiz';
  depozitoTutari?: number;
  kiraBaslangicTarihi: Date;
  kiraTutari?: number;
  sonKiraArtisTarihi?: Date;
  gelecekKiraArtisTarihi?: Date;
  beklenenKiraArtisOrani?: number;
  kiracıAdi?: string;
  kiracıTelefon?: string;
  dolulukDurumu: 'dolu' | 'bos';
  fotoğraflar?: string[];
  notlar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fatura {
  id: string;
  daireId: string;
  tip: 'su' | 'elektrik' | 'dogalgaz' | 'dask';
  tutar: number;
  sonOdemeTarihi: Date;
  odendi: boolean;
  odemeTarihi?: Date;
  notlar?: string;
  createdAt: Date;
}

export interface DaireFormData {
  ad: string;
  adres: string;
  suNumarasi: string;
  elektrikNumarasi: string;
  dogalgazNumarasi: string;
  daskNumarasi: string;
  depozitoDurumu: 'var' | 'yok' | 'belirsiz';
  depozitoTutari?: number;
  kiraBaslangicTarihi: Date;
  kiraTutari?: number;
  sonKiraArtisTarihi?: Date;
  gelecekKiraArtisTarihi?: Date;
  beklenenKiraArtisOrani?: number;
  kiracıAdi?: string;
  kiracıTelefon?: string;
  dolulukDurumu: 'dolu' | 'bos';
  fotoğraflar?: string[];
  notlar?: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddDaire: undefined;
  DaireDetail: { daireId: string };
  Stats: undefined;
};

