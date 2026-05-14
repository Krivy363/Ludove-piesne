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
  <TouchableOpacity backgroundColor: onPress="{()" style="{[styles.songCard," theme.card { }]}> onPress(item)}
  >
    <View style="{styles.songRow}">
      <Text color: style="{[styles.songTitle," theme.text { }]}>{item.nazov}</Text>
      {isFavorite && <Text style="{styles.miniHeart}">❤️</Text>}
    </View>
    <Text color: style="{[styles.arrow," theme.accent { }]}>〉</Text>
  </TouchableOpacity>
));

const DetailView = ({ vybrana, setVybrana, theme, favorites, toggleFavorite, fontSize, setFontSize }) => {
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
    <Animated.View 9999, [{ backgroundColor: slideAnim style="{[StyleSheet.absoluteFill," theme.bg, transform: translateY: zIndex: { }] }]}>
      <SafeAreaView 1 flex: style="{{" }}>
        <View 20 borderBottomColor: paddingHorizontal: style="{[styles.headerControls," theme.border, { }]}>
          <TouchableOpacity onPress="{()"> setVybrana(null)} style={styles.backButton}>
            <Text color: style="{[styles.backText," theme.accent { }]}>← Späť</Text>
          </TouchableOpacity>
          <View style="{styles.rightControls}">
            {vybrana && (
              <TouchableOpacity onPress="{()"> toggleFavorite(vybrana.id)}>
                <Text 24 fontSize: style="{{" }}>{favorites.includes(vybrana.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress="{()"> setFontSize(f => Math.max(12, f - 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text 'bold'}} fontWeight: style="{{color:" theme.accent,>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress="{()"> setFontSize(f => Math.min(45, f + 2))} style={[styles.zoomBtn, {backgroundColor: theme.btnBg}]}>
              <Text 'bold'}} fontWeight: style="{{color:" theme.accent,>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView 20 contentContainerStyle="{[styles.scrollContent," paddingHorizontal: { }]}>
          {vybrana && (
            <View backgroundColor: style="{[styles.detailCard," theme.card { }]}>
              <Text color: style="{[styles.detailNazov," theme.text { }]}>{vybrana.nazov}</Text>
              <View 1, 15}} backgroundColor: marginVertical: style="{{height:" theme.border,/>
              <Text color: fontSize, fontSize: style="{[styles.detailText," theme.text { }]}>{vybrana.text}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const ListScreen = ({ data, title, theme, favorites, setVybrana, isDarkMode, setIsDarkMode }) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = bezDiakritiky(search);
    return data.filter(p => !term || bezDiakritiky(p.nazov).includes(term) || bezDiakritiky(p.text).includes(term))
               .sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  }, [search, data]);

  return (
    <SafeAreaView backgroundColor: style="{[styles.container," theme.bg { }]}>
      <View 'ios' 0 30 : ? Platform.OS="==" backgroundColor: marginTop: style="{[styles.folkBorder," theme.accent, { }]}>
        <Text numberOfLines="{1}" style="{styles.folkPattern}">
          ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖
        </Text>
      </View>

      <View style="{styles.mainHeader}">
        <View style="{styles.titleWrapper}">
          <Text color: style="{[styles.title," theme.accent { }]}>{title}</Text>
        </View>
        <TouchableOpacity onPress="{()" style="{styles.modeToggle}"> setIsDarkMode(!isDarkMode)}>
          <Text 24 fontSize: style="{{" }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style="{styles.quoteContainer}"><Text color: style="{[styles.quoteText," theme.accent { }]}>„Kde sa spievajú ľudové piesne, tam žijú tradície.“</Text></View>
      <TextInput backgroundColor: borderColor: clearButtonMode="while-editing" color: onChangeText="{setSearch}" placeholder="Hľadať pieseň alebo text..." placeholderTextColor="#999" style="{[styles.searchBar," theme.border theme.card, theme.text, value="{search}" { }]}/>
      
      <FlatList data="{filtered}" keyExtractor="{item"> item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }} 
        renderItem={({ item }) => <SongItem isFavorite="{favorites.includes(item.id)}" item="{item}" onPress="{setVybrana}" theme="{theme}"/>}
        ListEmptyComponent={<Text style="{styles.emptyText}">Nenašli sa žiadne piesne</Text>}
      />
    </FlatList></SafeAreaView>
  );
};

const HistoryManager = ({ navigation }) => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const unsubscribe = navigation.addListener('state', (e) => {
      const routeName = e.data.state.routes[e.data.state.index].name;
      window.history.pushState({ tab: routeName }, '');
    });
    const handlePopState = (event) => {
      if (event.state && event.state.tab) { navigation.navigate(event.state.tab); }
      else { navigation.navigate('Ľudové piesne'); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => { unsubscribe(); window.removeEventListener('popstate', handlePopState); };
  }, [navigation]);
  return null;
};

export default function App() {
  const [vybrana, setVybrana] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(19);

  useEffect(() => {
    const backAction = () => { if (vybrana) { setVybrana(null); return true; } return false; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [vybrana]);

  useEffect(() => {
    if (Platform.OS === 'web' && vybrana) {
      window.history.pushState({ detailOpen: true }, '');
      const handlePopState = () => { if (vybrana) setVybrana(null); };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [vybrana]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "Ľudové piesne";
      const fontLink = document.createElement('link');
      fontLink.href = '[https://fonts.googleapis.com/css2?family=Lobster&display=swap](https://fonts.googleapis.com/css2?family=Lobster&display=swap)'; fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }
    const loadData = async () => { const saved = await AsyncStorage.getItem('@moje_srdiecka'); if (saved) setFavorites(JSON.parse(saved)); };
    loadData();
  }, []);

  useEffect(() => { AsyncStorage.setItem('@moje_srdiecka', JSON.stringify(favorites)); }, [favorites]);
  const toggleFavorite = useCallback((id) => { setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]); }, []);

  const theme = { bg: isDarkMode ? '#1a1a1a' : '#fdfbf7', card: isDarkMode ? '#2d2d2d' : '#fff', text: isDarkMode ? '#e0e0e0' : '#333', accent: '#8b4513', border: isDarkMode ? '#444' : '#e0d7c6', btnBg: isDarkMode ? '#3d3d3d' : '#f0e6d2' };

  return (
    <NavigationContainer>
      <View 1, backgroundColor: flex: style="{{" theme.bg }}>
        <StatusBar 'dark-content'} 'light-content' : ? barStyle="{isDarkMode"/>
        <DetailView favorites="{favorites}" fontSize="{fontSize}" setFontSize="{setFontSize}" setVybrana="{setVybrana}" theme="{theme}" toggleFavorite="{toggleFavorite}" vybrana="{vybrana}"/>
        <Tab.Navigator '#999', 'absolute', 'ios' 'transparent', 12 20, 30 30, 40, 65, : ? Platform.OS="==" backBehavior="firstRoute" backgroundColor: borderRadius: borderTopColor: elevation: false, headerShown: height: marginBottom: marginHorizontal: position: screenOptions="{{" tabBarActiveTintColor: tabBarInactiveTintColor: tabBarStyle: theme.accent, theme.card, { }, }}>
          <Tab.Screen 'Piesne', name="Ľudové piesne" options="{{" tabBarIcon: tabBarLabel:> <Text 22}} style="{{fontSize:">🎶</Text> }}>
            {({ navigation }) => (
              <>
                <HistoryManager navigation="{navigation}"/>
                <ListScreen data="{pesnickyData}" favorites="{favorites}" isDarkMode="{isDarkMode}" setIsDarkMode="{setIsDarkMode}" setVybrana="{setVybrana}" theme="{theme}" title="Ľudové piesne"/>
              </>
            )}
          </Tab.Screen>
          <Tab.Screen name="Obľúbené" options="{{" tabBarIcon:> <Text 22}} style="{{fontSize:">❤️</Text> }}>
            {({ navigation }) => (
              <>
                <HistoryManager navigation="{navigation}"/>
                <ListScreen data="{pesnickyData.filter(p"> favorites.includes(p.id))} title="Obľúbené" theme={theme} favorites={favorites} setVybrana={setVybrana} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              </>
            )}
          </ListScreen></Tab.Screen>
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
  mainHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 5, minHeight: 60, position: 'relative' },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { 
    fontSize: 34, 
    fontFamily: Platform.OS === 'web' ? "'Lobster', cursive" : 'serif', 
    textAlign: 'center',
    // Mierny posun, aby bol nadpis opticky v strede aj s ikonou mesiaca
    paddingLeft: 40 
  },
  modeToggle: { padding: 10 },
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
