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
          ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖
