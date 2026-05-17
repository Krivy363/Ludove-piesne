import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TextInput, 
  TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, BackHandler,
  Animated, Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { pesnickyData } from './songs'; 

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window');

const bezDiakritiky = (str) => {
  return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

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

const DetailView = ({ vybrana, zatvorDetail, theme, favorites, toggleFavorite, fontSize, setFontSize }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (vybrana) {
      setIsVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 40 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: screenHeight, duration: 300, useNativeDriver: true }).start(() => {
        setIsVisible(false);
      });
    }
  }, [vybrana]);

  if (!vybrana && !isVisible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, zIndex: 9999, transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.headerControls, { borderBottomColor: theme.border, paddingHorizontal: 20 }]}>
          <TouchableOpacity onPress={zatvorDetail} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.accent }]}>← Späť</Text>
          </TouchableOpacity>
          <View style={styles.rightControls}>
            {vybrana && (
              <TouchableOpacity onPress={() => toggleFavorite(vybrana.id)}>
                <Text style={{ fontSize: 24 }}>{favorites.includes(vybrana.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setFontSize(f => Math.max(12, f - 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text style={{color: theme.accent, fontWeight: 'bold'}}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize(f => Math.min(45, f + 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text style={{color: theme.accent, fontWeight: 'bold'}}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 20 }]}>
          {vybrana && (
            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.detailNazov, { color: theme.text }]}>{vybrana.nazov}</Text>
              <View style={{height: 1, backgroundColor: theme.border, marginVertical: 15}} />
              <Text style={[styles.detailText, { fontSize: fontSize, color: theme.text }]}>{vybrana.text}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const ListScreen = ({ data, title, theme, favorites, otvorDetail, isDarkMode, setIsDarkMode, search, aktualizujHladanie }) => {
  const filtered = useMemo(() => {
    const term = bezDiakritiky(search);
    return data.filter(p => !term || bezDiakritiky(p.nazov).includes(term) || bezDiakritiky(p.text).includes(term))
               .sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  }, [search, data]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.folkBorder, { backgroundColor: theme.accent, marginTop: Platform.OS === 'ios' ? 0 : 30 }]}>
        <Text style={styles.folkPattern} numberOfLines={1}>
          ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖
        </Text>
      </View>

      <View style={styles.mainHeader}>
        <View style={styles.titleWrapper}><Text style={[styles.title, { color: theme.accent }]}>{title}</Text></View>
        <TouchableOpacity style={styles.modeToggle} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={{ fontSize: 24 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quoteContainer}><Text style={[styles.quoteText, { color: theme.accent }]}>„Kde sa spievajú ľudové piesne, tam žijú tradície.“</Text></View>
      
      <TextInput 
        style={[styles.searchBar, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} 
        placeholder="Hľadať pieseň alebo text..." 
        placeholderTextColor="#999" 
        onChangeText={aktualizujHladanie} 
        value={search} 
        clearButtonMode="while-editing"
      />
      
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }} 
        renderItem={({ item }) => <SongItem item={item} isFavorite={favorites.includes(item.id)} onPress={otvorDetail} theme={theme} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenašli sa žiadne piesne</Text>}
      />
    </SafeAreaView>
  );
};

export default function App() {
  const [vybrana, setVybrana] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [search, setSearch] = useState('');
  const [otvoreneZHladania, setOtvoreneZHladania] = useState(false);

  const vybranaRef = useRef(vybrana);
  const searchRef = useRef(search);
  const otvoreneZHladaniaRef = useRef(otvoreneZHladania);

  useEffect(() => { vybranaRef.current = vybrana; }, [vybrana]);
  useEffect(() => { searchRef.current = search; }, [search]);
  useEffect(() => { otvoreneZHladaniaRef.current = otvoreneZHladania; }, [otvoreneZHladania]);

  // WEB AJ MOBIL: Riadenie histórie pri písaní textu
  const aktualizujHladanie = useCallback((text) => {
    if (Platform.OS === 'web') {
      // Ak začíname písať do prázdneho poľa, pridáme bod do histórie
      if (searchRef.current === '' && text !== '') {
        window.location.hash = 'search';
      } 
      // Ak pole úplne vymažeme manuálne, odstránime hash bez kroku späť
      else if (text === '') {
        window.history.replaceState(null, '', ' ');
      }
    }
    setSearch(text);
  }, []);

  const otvorDetail = useCallback((item) => {
    if (searchRef.current.length > 0) {
      setOtvoreneZHladania(true);
      if (Platform.OS === 'web') {
        window.location.hash = 'detail-search';
      }
    } else {
      setOtvoreneZHladania(false);
      if (Platform.OS === 'web') {
        window.location.hash = 'detail';
      }
    }
    setVybrana(item);
  }, []);

  const zatvorDetail = useCallback(() => {
    setVybrana(null);
    if (!otvoreneZHladaniaRef.current) {
      setSearch('');
      if (Platform.OS === 'web') window.history.replaceState(null, '', ' ');
    } else {
      if (Platform.OS === 'web') window.location.hash = 'search';
    }
  }, []);

  // 1. KÓD PRE MOBILNÝ ANDROID (Hardvérové tlačidlo späť)
  useEffect(() => {
    const backAction = () => {
      if (vybranaRef.current) {
        setVybrana(null);
        if (!otvoreneZHladaniaRef.current) {
          setSearch('');
        }
        return true; 
      }
      if (searchRef.current.length > 0) {
        setSearch('');
        setOtvoreneZHladania(false);
        return true; 
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // 2. KÓD PRE WEBOVÝ PREHLIADAČ (Šípka späť na webe)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleHashChange = () => {
      const hash = window.location.hash;

      // Ak bol otvorený detail a používateľ stlačil späť
      if (vybranaRef.current && !hash.includes('detail')) {
        setVybrana(null);
        if (!otvoreneZHladaniaRef.current) {
          setSearch('');
        }
      } 
      // Ak bol detail zatvorený, sme na zozname a zmazal sa hash 'search'
      else if (!vybranaRef.current && searchRef.current.length > 0 && hash !== '#search') {
        setSearch('');
        setOtvoreneZHladania(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "Ľudové piesne";
      const fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Lobster&display=swap'; fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);

      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }
    const loadData = async () => { const saved = await AsyncStorage.getItem('@moje_srdiecka'); if (saved) setFavorites(JSON.parse(saved)); };
    loadData();
  }, []);

  useEffect(() => { AsyncStorage.setItem('@moje_srdiecka', JSON.stringify(favorites)); }, [favorites]);
  const toggleFavorite = useCallback((id) => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }, []);

  const theme = { bg: isDarkMode ? '#1a1a1a' : '#fdfbf7', card: isDarkMode ? '#2d2d2d' : '#fff', text: isDarkMode ? '#e0e0e0' : '#333', accent: '#8b4513', border: isDarkMode ? '#444' : '#e0d7c6', btnBg: isDarkMode ? '#3d3d3d' : '#f0e6d2' };

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <DetailView vybrana={vybrana} zatvorDetail={zatvorDetail} theme={theme} favorites={favorites} toggleFavorite={toggleFavorite} fontSize={fontSize} setFontSize={setFontSize}/>
        
        <Tab.Navigator screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { backgroundColor: theme.card, borderTopColor: 'transparent', height: 65, marginBottom: Platform.OS === 'ios' ? 30 : 20, marginHorizontal: 30, borderRadius: 40, position: 'absolute', elevation: 12 }, 
          tabBarActiveTintColor: theme.accent, 
          tabBarInactiveTintColor: '#999',
        }}>
          <Tab.Screen name="Ľudové piesne" options={{ tabBarLabel: 'Piesne', tabBarIcon: () => <Text style={{fontSize: 22}}>🎶</Text> }}>
            {props => <ListScreen {...props} data={pesnickyData} title="Ľudové piesne" theme={theme} favorites={favorites} otvorDetail={otvorDetail} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} search={search} aktualizujHladanie={aktualizujHladanie} />}
          </Tab.Screen>
          <Tab.Screen name="Obľúbené" options={{ tabBarIcon: () => <Text style={{fontSize: 22}}>❤️</Text> }}>
            {props => <ListScreen {...props} data={pesnickyData.filter(p => favorites.includes(p.id))} title="Obľúbené" theme={theme} favorites={favorites} otvorDetail={otvorDetail} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} search={search} aktualizujHladanie={aktualizujHladanie} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  folkBorder: { height: 24, width: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 5 },
  folkPattern: { 
    color: '#fff', fontSize: 16, letterSpacing: 2, fontWeight: 'bold', width: '100%', textAlign: 'center',
    ...Platform.select({ web: { textOverflow: 'clip', whiteSpace: 'nowrap' } })
  },
  mainHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 5, position: 'relative', minHeight: 50 },
  titleWrapper: { flex: 1, alignItems: 'center' },
  title: { fontSize: 34, fontFamily: Platform.OS === 'web' ? "'Lobster', cursive" : 'serif', textAlign: 'center' },
  modeToggle: { position: 'absolute', right: 20, padding: 10 },
  quoteContainer: { paddingVertical: 5, alignItems: 'center', marginBottom: 15, paddingHorizontal: 20 },
  quoteText: { fontSize: 16, textAlign: 'center', fontFamily: Platform.OS === 'web' ? "'Lobster', cursive" : 'serif', opacity: 0.8 },
  searchBar: { padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 20, fontSize: 16, marginHorizontal: 20 },
  songCard: { padding: 18, borderRadius: 15, marginBottom: 10, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  songRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  songTitle: { fontSize: 20, fontFamily: Platform.OS === 'web' ? "'Lobster', cursive" : 'serif' },
  arrow: { fontSize: 18 },
  headerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 15, borderBottomWidth: 1, marginBottom: 10 },
  backButton: { paddingLeft: 20, paddingVertical: 10 },
  backText: { fontSize: 18, fontWeight: 'bold' },
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 20 },
  zoomBtn: { padding: 8, borderRadius: 10, minWidth: 40, alignItems: 'center' },
  detailCard: { borderRadius: 20, padding: 25, elevation: 3, marginTop: 10 },
  detailNazov: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', fontFamily: Platform.OS === 'web' ? "'Lobster', cursive" : 'serif' },
  detailText: { lineHeight: 32, textAlign: 'center' },
  scrollContent: { paddingBottom: 160 }, 
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});
  
