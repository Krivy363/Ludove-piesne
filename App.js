import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TextInput, 
  TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, BackHandler,
  Animated, Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { pesnickyData } from './songs'; 

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window');
const navigationRef = createNavigationContainerRef();

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
      {isFavorite && <Text style={{ marginLeft: 8 }}>❤️</Text>}
    </View>
    <Text style={[styles.arrow, { color: theme.accent }]}>〉</Text>
  </TouchableOpacity>
));

const AboutView = ({ viditelne, zatvorAbout, theme }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (viditelne) {
      setIsVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 40 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: screenHeight, duration: 300, useNativeDriver: true }).start(() => {
        setIsVisible(false);
      });
    }
  }, [viditelne]);

  if (!viditelne && !isVisible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, zIndex: 10000, transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.headerControlsAbout, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={zatvorAbout} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.accent }]}>← Späť</Text>
          </TouchableOpacity>
          <Text style={[styles.aboutHeaderTitle, { color: theme.text }]}>O aplikácii</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContentAbout}>
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.aboutSectionTitle, { color: theme.accent }]}>Prečo táto aplikácia vznikla?</Text>
            <Text style={[styles.aboutText, { color: theme.text }]}>
              Táto aplikácia vznikla z lásky k slovenským tradíciám a ľudovým piesňam. Mojím cieľom bolo vytvoriť jednoduchý, moderný a rýchly spevník, ktorý môžete mať kedykoľvek so sebou vo vrecku – či už ste na oslave, posedení pri tónoch akordeónu, alebo si len chcete zaspomínať na naše kultúrne dedičstvo.
            </Text>

            <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 20 }} />

            <Text style={[styles.aboutSectionTitle, { color: theme.accent }]}>Podpora projektu</Text>
            <Text style={[styles.aboutText, { color: theme.text }]}>
              Ak sa vám aplikácia páči, pomáha vám a chceli by ste ma podporiť v jej ďalšom vývoji (pridávanie nových funkcií, piesní a prevádzka), budem nesmierne vďačný za akýkoľvek dobrovoľný príspevok.
            </Text>

            <View style={[styles.bankContainer, { backgroundColor: theme.btnBg, borderColor: theme.border }]}>
              <Text style={[styles.bankLabel, { color: theme.text }]}>Číslo účtu (IBAN):</Text>
              <Text style={[styles.bankIban, { color: theme.accent }]} selectable={true}>
                SK00 0000 0000 0000 0000 0000
              </Text>
              <Text style={{ fontSize: 11, color: '#888', marginTop: 5, textAlign: 'center' }}>
                (Dlhým podržaním môžete IBAN skopírovať)
              </Text>
            </View>

            <Text style={[styles.bankLabel, { color: theme.text, marginTop: 15, marginBottom: 10 }]}>Platba cez QR kód:</Text>
            <View style={styles.qrContainer}>
              <View style={[styles.qrPlaceholder, { borderColor: theme.border }]}>
                <Text style={{ color: '#888', textAlign: 'center', fontSize: 13 }}>Tu sa zobrazí tvoj platobný QR kód, keď ho vložíš do projektu.</Text>
              </View>
            </View>

            <Text style={styles.aboutFooter}>Ďakujem za každú podporu a prajem príjemné spievane! 🎶</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

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

const ListScreen = ({ data, theme, favorites, otvorDetail, isDarkMode, setIsDarkMode, search, aktualizujHladanie, otvorAbout }) => {
  const filtered = useMemo(() => {
    const term = bezDiakritiky(search);
    return data.filter(p => !term || bezDiakritiky(p.nazov).includes(term) || bezDiakritiky(p.text).includes(term))
               .sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  }, [search, data]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.folkBorder, { backgroundColor: theme.accent, marginTop: Platform.OS === 'ios' ? 0 : 30 }]}>
        <Text style={styles.folkPattern} numberOfLines={1}>
          ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖
        </Text>
      </View>

      <View style={styles.mainHeader}>
        <View style={styles.headerLeftSpacer} />
        
        <Text style={[styles.title, { color: theme.accent }]}>Ľudové piesne</Text>
        
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.iconTouch} onPress={() => setIsDarkMode(!isDarkMode)}>
            <Text style={{ fontSize: 24 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconTouch} onPress={otvorAbout}>
            <Text style={{ fontSize: 24 }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quoteContainer}>
        <Text style={[styles.quoteText, { color: theme.accent }]}>„Kde sa spievajú ľudové piesne, tam žijú tradície.“</Text>
      </View>
      
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
  const [aboutVisible, setAboutVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(19);
  const [search, setSearch] = useState('');
  const [otvoreneZHladania, setOtvoreneZHladania] = useState(false);

  const vybranaRef = useRef(vybrana);
  const aboutVisibleRef = useRef(aboutVisible);
  const searchRef = useRef(search);
  const otvoreneZHladaniaRef = useRef(otvoreneZHladania);

  useEffect(() => { vybranaRef.current = vybrana; }, [vybrana]);
  useEffect(() => { aboutVisibleRef.current = aboutVisible; }, [aboutVisible]);
  useEffect(() => { searchRef.current = search; }, [search]);
  useEffect(() => { otvoreneZHladaniaRef.current = otvoreneZHladania; }, [otvoreneZHladania]);

  const aktualizujHladanie = useCallback((text) => {
    if (Platform.OS === 'web') {
      if (searchRef.current === '' && text !== '') {
        window.location.hash = 'search';
      } 
      else if (text === '') {
        window.history.replaceState(null, '', ' ');
      }
    }
    setSearch(text);
  }, []);

  const otvorDetail = useCallback((item) => {
    if (searchRef.current.length > 0) {
      setOtvoreneZHladania(true);
      if (Platform.OS === 'web') window.location.hash = 'detail-search';
    } else {
      setOtvoreneZHladania(false);
      if (Platform.OS === 'web') window.location.hash = 'detail';
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

  const otvorAbout = useCallback(() => {
    if (Platform.OS === 'web') window.location.hash = 'about';
    setAboutVisible(true);
  }, []);

  const zatvorAbout = useCallback(() => {
    setAboutVisible(false);
    if (Platform.OS === 'web') window.history.replaceState(null, '', ' ');
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (aboutVisibleRef.current) {
        setAboutVisible(false);
        return true;
      }
      if (vybranaRef.current) {
        setVybrana(null);
        if (!otvoreneZHladaniaRef.current) setSearch('');
        return true; 
      }
      if (searchRef.current.length > 0) {
        setSearch('');
        setOtvoreneZHladania(false);
        return true; 
      }

      if (navigationRef.isReady()) {
        const aktualnaTrasa = navigationRef.getCurrentRoute();
        if (aktualnaTrasa && aktualnaTrasa.name === 'SongsTab') {
          return false; 
        }
        if (aktualnaTrasa && aktualnaTrasa.name === 'FavoritesTab') {
          navigationRef.navigate('SongsTab');
          if (Platform.OS === 'web') window.history.replaceState(null, '', ' ');
          return true; 
        }
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleHashChange = () => {
      const hash = window.location.hash;

      if (aboutVisibleRef.current && hash !== '#about') {
        setAboutVisible(false);
      }
      else if (vybranaRef.current && !hash.includes('detail')) {
        setVybrana(null);
        if (!otvoreneZHladaniaRef.current) setSearch('');
      } 
      else if (!vybranaRef.current && searchRef.current.length > 0 && hash !== '#search') {
        setSearch('');
        setOtvoreneZHladania(false);
      }
      else if (hash === '' && navigationRef.isReady()) {
        const aktualnaTrasa = navigationRef.getCurrentRoute();
        if (aktualnaTrasa && aktualnaTrasa.name === 'FavoritesTab') {
