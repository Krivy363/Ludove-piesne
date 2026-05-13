import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TextInput, 
  TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- IMPORT DÁT ---
import { pesnickyData } from './songs'; 

const Tab = createBottomTabNavigator();

// --- POMOCNÉ FUNKCIE ---
const bezDiakritiky = (str) => {
  return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

// --- KOMPONENTY ---

const SongItem = React.memo(({ item, isFavorite, onPress, theme }) => (
  <TouchableOpacity 
    style={[styles.songCard, { backgroundColor: theme.card }]} 
    onPress={() => onPress(item)}
  >
    <View style={styles.songRow}>
      <Text style={[styles.songTitle, { color: theme.text }]}>{item.nazov}</Text>
      {isFavorite && <Text style={styles.miniHeart}>❤️</Text>}
    </View>
    <Text style={[styles.arrow, { color: theme.accent }]}>〉</Text>
  </TouchableOpacity>
));

const DetailView = ({ vybrana, setVybrana, theme, favorites, toggleFavorite, fontSize, setFontSize }) => {
  if (!vybrana) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, zIndex: 9999 }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.headerControls, { borderBottomColor: theme.border, paddingHorizontal: 20 }]}>
          <TouchableOpacity onPress={() => setVybrana(null)} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.accent }]}>← Späť</Text>
          </TouchableOpacity>
          <View style={styles.rightControls}>
            <TouchableOpacity onPress={() => toggleFavorite(vybrana.id)}>
              <Text style={{ fontSize: 24 }}>{favorites.includes(vybrana.id) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize(f => Math.max(12, f - 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text style={{color: theme.accent, fontWeight: 'bold'}}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize(f => Math.min(45, f + 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text style={{color: theme.accent, fontWeight: 'bold'}}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 20 }]}>
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.detailNazov, { color: theme.accent }]}>{vybrana.nazov}</Text>
            <View style={{height: 1, backgroundColor: theme.border, marginVertical: 15}} />
            <Text style={[styles.detailText, { fontSize: fontSize, color: theme.text }]}>{vybrana.text}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const ListScreen = ({ data, title, theme, favorites, setVybrana, isDarkMode, setIsDarkMode }) => {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    const term = bezDiakritiky(search);
    
    return data
      .filter(p => {
        if (!term) return true;
        const vNazve = bezDiakritiky(p.nazov).includes(term);
        const vTexte = bezDiakritiky(p.text).includes(term);
        return vNazve || vTexte;
      })
      .sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  }, [search, data]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.mainHeader}>
        <Text style={[styles.title, { color: theme.accent }]}>{title}</Text>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={{ fontSize: 24 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput 
        style={[styles.searchBar, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} 
        placeholder="Hľadať pieseň alebo text..." 
        placeholderTextColor="#999"
        onChangeText={setSearch}
        value={search}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }} 
        renderItem={({ item }) => (
          <SongItem 
            item={item} 
            isFavorite={favorites.includes(item.id)} 
            onPress={setVybrana} 
            theme={theme} 
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenašli sa žiadne piesne</Text>}
        initialNumToRender={15}
      />
    </SafeAreaView>
  );
};

// --- HLAVNÁ APLIKÁCIA ---
export default function App() {
  const [vybrana, setVybrana] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(19);

  // --- LOGIKA PRE TLAČIDLO SPÄŤ (WEB AJ ANDROID) ---
  useEffect(() => {
    if (vybrana) {
      // Keď otvoríme detail, pridáme stav do histórie prehliadača
      if (Platform.OS === 'web') {
        window.history.pushState({ detailOpen: true }, '');
      }

      // Pre Android (ak by si to niekedy balil ako appku)
      const backAction = () => {
        setVybrana(null);
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      // Pre Web: počúvame na stlačenie šípky späť v prehliadači
      const handleWebBack = () => {
        setVybrana(null);
      };
      if (Platform.OS === 'web') {
        window.addEventListener('popstate', handleWebBack);
      }

      return () => {
        backHandler.remove();
        if (Platform.OS === 'web') {
          window.removeEventListener('popstate', handleWebBack);
        }
      };
    }
  }, [vybrana]);

  // --- NASTAVENIE IKONY A TITULKU ---
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "Ľudové piesne";
      const iconUrl = "[https://ludovepiesne.vercel.app/logo.png](https://ludovepiesne.vercel.app/logo.png)"; // Používame už logo.png

      const links = document.querySelectorAll("link[rel*='icon'], link[rel*='apple-touch-icon']");
      links.forEach(l => l.remove());

      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = iconUrl;
      document.head.appendChild(link);

      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = iconUrl;
      document.head.appendChild(appleLink);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('@moje_srdiecka');
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) { console.log("Chyba načítania", e); }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@moje_srdiecka', JSON.stringify(favorites));
      } catch (e) { console.log("Chyba ukladania", e); }
    };
    saveData();
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const theme = {
    bg: isDarkMode ? '#1a1a1a' : '#fdfbf7',
    card: isDarkMode ? '#2d2d2d' : '#fff',
    text: isDarkMode ? '#e0e0e0' : '#333',
    accent: '#8b4513',
    border: isDarkMode ? '#444' : '#e0d7c6',
    btnBg: isDarkMode ? '#3d3d3d' : '#f0e6d2'
  };

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <DetailView 
          vybrana={vybrana} 
          setVybrana={setVybrana} 
          theme={theme} 
          favorites={favorites} 
          toggleFavorite={toggleFavorite}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />

        <Tab.Navigator screenOptions={{ 
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: theme.card, 
            borderTopColor: 'transparent',
            height: 65, 
            paddingBottom: 8, 
            paddingTop: 8,
            marginBottom: Platform.OS === 'ios' ? 30 : 20,
            marginHorizontal: 30,
            borderRadius: 40,
            position: 'absolute',
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: '#999',
        }}>
          <Tab.Screen name="Ľudové piesne" options={{ title: 'Ľudové piesne', tabBarLabel: 'Všetky', tabBarIcon: () => <Text style={{fontSize: 22}}>🎶</Text> }}>
            {() => (
              <ListScreen 
                data={pesnickyData} 
                title="Ľudové piesne" 
                theme={theme} 
                favorites={favorites} 
                setVybrana={setVybrana}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Obľúbené" options={{ tabBarIcon: () => <Text style={{fontSize: 22}}>❤️</Text> }}>
            {() => (
              <ListScreen 
                data={pesnickyData.filter(p => favorites.includes(p.id))} 
                title="Obľúbené" 
                theme={theme} 
                favorites={favorites} 
                setVybrana={setVybrana}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'ios' ? 10 : 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold' },
  searchBar: { padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 20, fontSize: 16 },
  songCard: { padding: 18, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  songRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  songTitle: { fontSize: 17, fontWeight: '600' },
  miniHeart: { marginLeft: 8 },
  arrow: { fontSize: 18 },
  headerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 15, borderBottomWidth: 1, marginBottom: 10 },
  backButton: { paddingRight: 20, paddingVertical: 10 },
  backText: { fontSize: 18, fontWeight: 'bold' },
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoomBtn: { padding: 10, borderRadius: 10, minWidth: 42, alignItems: 'center' },
  detailCard: { borderRadius: 20, padding: 25, elevation: 3, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  detailNazov: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  detailText: { lineHeight: 32, textAlign: 'center' },
  scrollContent: { paddingBottom: 160 }, 
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});
      
