import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDaire } from '../context/DaireContext';
import { Daire } from '../types';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { daireler } = useDaire();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Her dakika tarihi güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setSelectedYear(now.getFullYear());
      setSelectedMonth(now.getMonth());
    }, 60000); // 1 dakika

    return () => clearInterval(interval);
  }, []);

  // Toplam istatistikler
  const totalDaireler = daireler.length;
  const doluDaireler = daireler.filter(d => d.dolulukDurumu === 'dolu').length;
  const bosDaireler = daireler.filter(d => d.dolulukDurumu === 'bos').length;
  const dolulukOrani = totalDaireler > 0 ? (doluDaireler / totalDaireler) * 100 : 0;

  // Kira gelirleri - Sadece dolu daireler
  const toplamKiraGeliri = daireler.reduce((total, daire) => {
    if (daire.dolulukDurumu === 'dolu') {
      return total + (daire.kiraTutari || 0);
    }
    return total;
  }, 0);

  const aylikKiraGeliri = daireler.reduce((total, daire) => {
    if (daire.kiraTutari && daire.dolulukDurumu === 'dolu') {
      return total + daire.kiraTutari;
    }
    return total;
  }, 0);

  // Aylık/Yıllık gelir grafiği için veri
  const getChartData = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    if (selectedPeriod === 'month') {
      // Son 12 ayın verilerini al
      const monthlyData = [];
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      
      for (let i = 11; i >= 0; i--) {
        const targetMonth = (currentMonth - i + 12) % 12;
        const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
        
        // O ay için kira gelirini hesapla - Sadece dolu daireler
        const monthIncome = daireler.reduce((total, daire) => {
          if (daire.kiraTutari && daire.dolulukDurumu === 'dolu' && daire.kiraBaslangicTarihi) {
            const kiraBaslangic = new Date(daire.kiraBaslangicTarihi);
            const kiraBaslangicMonth = kiraBaslangic.getMonth();
            const kiraBaslangicYear = kiraBaslangic.getFullYear();
            
            // Eğer kira başlangıcı bu aydan önce veya bu ayda ise gelir sayılır
            if (kiraBaslangicYear < targetYear || 
                (kiraBaslangicYear === targetYear && kiraBaslangicMonth <= targetMonth)) {
              return total + daire.kiraTutari;
            }
          }
          return total;
        }, 0);
        
        monthlyData.push({
          label: monthNames[targetMonth],
          income: monthIncome,
          period: targetMonth,
          year: targetYear,
          isCurrent: targetMonth === currentMonth && targetYear === currentYear
        });
      }
      
      return monthlyData;
    } else {
      // Son 5 yılın verilerini al
      const yearlyData = [];
      
      for (let i = 4; i >= 0; i--) {
        const targetYear = currentYear - i;
        
        // O yıl için kira gelirini hesapla - Sadece dolu daireler
        const yearIncome = daireler.reduce((total, daire) => {
          if (daire.kiraTutari && daire.dolulukDurumu === 'dolu' && daire.kiraBaslangicTarihi) {
            const kiraBaslangic = new Date(daire.kiraBaslangicTarihi);
            const kiraBaslangicYear = kiraBaslangic.getFullYear();
            
            // Eğer kira başlangıcı bu yıldan önce veya bu yılda ise gelir sayılır
            if (kiraBaslangicYear <= targetYear) {
              return total + (daire.kiraTutari * 12); // Yıllık gelir
            }
          }
          return total;
        }, 0);
        
        yearlyData.push({
          label: targetYear.toString(),
          income: yearIncome,
          period: targetYear,
          year: targetYear,
          isCurrent: targetYear === currentYear
        });
      }
      
      return yearlyData;
    }
  };

  const chartData = getChartData();
  const maxIncome = Math.max(...chartData.map((d: any) => d.income)) || 1; // 0 olmaması için 1 yapıyoruz

  // En yüksek kiralı daireler - Sadece dolu daireler
  const enYuksekKiralar = [...daireler]
    .filter(d => d.kiraTutari && d.dolulukDurumu === 'dolu')
    .sort((a, b) => (b.kiraTutari || 0) - (a.kiraTutari || 0))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistikler & Raporlar</Text>
        <Text style={styles.headerSubtitle}>Kahraman uygulamanızın genel durumu</Text>
      </View>

      {/* Zaman Seçimi */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriodButton]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.activePeriodButtonText]}>
            Aylık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'year' && styles.activePeriodButton]}
          onPress={() => setSelectedPeriod('year')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.activePeriodButtonText]}>
            Yıllık
          </Text>
        </TouchableOpacity>
      </View>

      {/* Genel İstatistikler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel Durum</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="home-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{totalDaireler}</Text>
            <Text style={styles.statLabel}>Toplam Daire</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="person-outline" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{doluDaireler}</Text>
            <Text style={styles.statLabel}>Dolu Daire</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="home" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{bosDaireler}</Text>
            <Text style={styles.statLabel}>Boş Daire</Text>
          </View>
          

          
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>%{dolulukOrani.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Doluluk Oranı</Text>
          </View>
        </View>
      </View>

      {/* Gelir İstatistikleri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gelir Bilgileri</Text>
        <View style={styles.incomeCards}>
          <View style={styles.incomeCard}>
            <Ionicons name="cash-outline" size={32} color="#4CAF50" />
            <Text style={styles.incomeValue}>{toplamKiraGeliri.toLocaleString('tr-TR')} ₺</Text>
            <Text style={styles.incomeLabel}>Toplam Kira Geliri</Text>
          </View>
          
          <View style={styles.incomeCard}>
            <Ionicons name="calendar-outline" size={32} color="#2196F3" />
            <Text style={styles.incomeValue}>{aylikKiraGeliri.toLocaleString('tr-TR')} ₺</Text>
            <Text style={styles.incomeLabel}>Aylık Kira Geliri</Text>
          </View>
        </View>
      </View>



      {/* En Yüksek Kiralar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>En Yüksek Kiralar</Text>
        {enYuksekKiralar.map((daire, index) => (
          <View key={daire.id} style={styles.topRentItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.rentInfo}>
              <Text style={styles.rentAddress}>{daire.adres}</Text>
              <Text style={styles.rentAmount}>{daire.kiraTutari?.toLocaleString('tr-TR')} ₺</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Gelişmiş Gelir Grafiği */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedPeriod === 'month' ? 'Son 12 Ay Gelir Grafiği' : 'Son 5 Yıl Gelir Grafiği'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Son güncelleme: {currentDate.toLocaleDateString('tr-TR')} {currentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.chartContainer}>
          {chartData.map((data: any, index: number) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(20, (data.income / maxIncome) * 100),
                      backgroundColor: data.isCurrent ? '#2196F3' : (data.income > 0 ? '#4CAF50' : '#E0E0E0'),
                      borderWidth: data.isCurrent ? 2 : 0,
                      borderColor: data.isCurrent ? '#1976D2' : 'transparent',
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.barLabel, 
                data.isCurrent && styles.currentMonthLabel
              ]}>
                {data.label}
              </Text>
              <Text style={[
                styles.barValue, 
                data.isCurrent && styles.currentMonthValue
              ]}>
                {data.income.toLocaleString('tr-TR')} ₺
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Gelir</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>
              {selectedPeriod === 'month' ? 'Bu Ay' : 'Bu Yıl'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>Gelir Yok</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  incomeCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  incomeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  topRentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rentInfo: {
    flex: 1,
  },
  rentAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  rentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 10,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  currentMonthLabel: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  currentMonthValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
