import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import ImageViewer from 'react-native-image-zoom-viewer';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@malik_shop_products_v3';

export default function App() {
  const ADMIN_PASSWORD = "1234";

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // Gestion du Panier
  const [showCartModal, setShowCartModal] = useState(false);
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Formulaire Admin
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState(['', '', '']);
  const [video, setVideo] = useState('');

  // Modal Vue Client & Zoom
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) setProducts(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const saveProductsToStorage = async (newProducts) => {
    try {
      setProducts(newProducts);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (e) {
      console.error(e);
    }
  };

  // --- GESTION DU PANIER ---
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Alert.alert("🛒 Panier", `${product.title} a été ajouté à votre panier !`);
  };

  const updateQuantity = (id, delta) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // --- SELECTION DES MEDIAS ---
  const pickImage = async (index) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission requise", "Accès à la galerie nécessaire.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission requise", "Accès à la galerie nécessaire.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 60,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setVideo(result.assets[0].uri);
  };

  const removeVideo = () => setVideo('');

  const handleAdminLogin = () => {
    if (inputPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setInputPassword('');
      Alert.alert("Succès", "Connecté en Mode Administrateur !");
    } else {
      Alert.alert("Erreur", "Mot de passe incorrect.");
    }
  };

  const openProductForm = (product = null) => {
    if (product) {
      setEditingProductId(product.id);
      setTitle(product.title);
      setPrice(product.price.toString());
      setCategory(product.category);
      setDescription(product.description || '');
      setLocation(product.location || '');
      setContact(product.contact || '');
      const imgs = [...(product.images || ['', '', ''])];
      while (imgs.length < 3) imgs.push('');
      setImages(imgs);
      setVideo(product.video || '');
    } else {
      setEditingProductId(null);
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setLocation('');
      setContact('');
      setImages(['', '', '']);
      setVideo('');
    }
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!title || !price || !category) {
      Alert.alert("Attention", "Veuillez remplir le titre, le prix et la catégorie.");
      return;
    }

    const validImages = images.filter(img => img !== '');
    const finalImages = validImages.length > 0 ? validImages : ['https://via.placeholder.com/400/1e293b/ffffff?text=MalikShop'];

    const newProduct = {
      id: editingProductId || Date.now().toString(),
      title,
      price: parseFloat(price),
      category,
      description,
      location,
      contact,
      images: finalImages,
      video
    };

    let updatedList;
    if (editingProductId) {
      updatedList = products.map(p => p.id === editingProductId ? newProduct : p);
    } else {
      updatedList = [...products, newProduct];
    }

    saveProductsToStorage(updatedList);
    setShowProductModal(false);
  };

  const deleteProduct = (id) => {
    Alert.alert("Suppression", "Voulez-vous supprimer cet article ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => saveProductsToStorage(products.filter(p => p.id !== id)) }
    ]);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const theme = {
    bg: isDarkMode ? '#0b0f19' : '#f4f6f8',
    cardBg: isDarkMode ? '#1f2937' : '#ffffff',
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#0f172a',
    textSub: isDarkMode ? '#9ca3af' : '#64748b',
    border: isDarkMode ? '#1f2937' : '#e2e8f0',
    inputBg: isDarkMode ? '#111827' : '#ffffff',
  };

  // Préparation des images pour le composant de Zoom Pincement
  const zoomImagesFormatted = selectedProduct ? selectedProduct.images.map(url => ({ url })) : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBg} />

      {/* En-Tête MalikShop avec Bouton Panier */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.logoText, { color: theme.text }]}>🛒 <Text style={styles.logoBold}>Malik</Text><Text style={styles.logoGold}>Shop</Text></Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* BOUTON PANIER */}
            <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => setShowCartModal(true)}>
              <Text style={{ fontSize: 16 }}>🛒</Text>
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.reduce((a, c) => a + c.quantity, 0)}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.themeToggleBtn, { backgroundColor: theme.border }]} onPress={() => setIsDarkMode(!isDarkMode)}>
              <Text style={{ fontSize: 14 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.adminBadge, { backgroundColor: theme.border }]} onPress={() => isAdminLoggedIn ? setIsAdminLoggedIn(false) : setShowAdminLogin(true)}>
              <Text style={styles.adminBadgeText}>{isAdminLoggedIn ? "🔓 Admin" : "🔒 Admin"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isAdminLoggedIn && (
        <TouchableOpacity style={styles.addButton} onPress={() => openProductForm()}>
          <Text style={styles.addButtonText}>➕ Mettre un article en vente</Text>
        </TouchableOpacity>
      )}

      {/* Catalogue */}
      <ScrollView style={styles.catalog} showsVerticalScrollIndicator={false}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun produit disponible</Text>
            <Text style={styles.emptySub}>Ajoutez vos articles depuis l'espace Admin.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: theme.cardBg }]}>
                <TouchableOpacity onPress={() => { setSelectedProduct(product); setActiveMediaIndex(0); }}>
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()} FCFA</Text>
                  </View>
                </TouchableOpacity>

                {isAdminLoggedIn && (
                  <View style={[styles.adminActions, { borderColor: theme.border }]}>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.bg }]} onPress={() => openProductForm(product)}>
                      <Text style={styles.editBtnText}>✏️ Éditer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(product.id)}>
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL : PANIER CLIENT */}
      <Modal visible={showCartModal} animationType="slide" onRequestClose={() => setShowCartModal(false)}>
        <SafeAreaView style={[styles.modalDarkContainer, { backgroundColor: theme.bg, padding: 20 }]}>
          <View style={styles.cartHeader}>
            <Text style={[styles.modalMainTitle, { color: theme.text }]}>🛒 Mon Panier</Text>
            <TouchableOpacity onPress={() => setShowCartModal(false)}>
              <Text style={styles.closeBtnText}>✕ Fermer</Text>
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Votre panier est vide</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1, marginTop: 15 }}>
              {cart.map(item => (
                <View key={item.id} style={[styles.cartItemRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  <Image source={{ uri: item.images[0] }} style={styles.cartItemThumb} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.title}</Text>
                    <Text style={{ color: '#10b981', fontWeight: 'bold', marginTop: 2 }}>{item.price.toLocaleString()} FCFA</Text>
                  </View>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontWeight: 'bold', marginHorizontal: 8 }}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <Text style={[styles.totalText, { color: theme.text }]}>Total : <Text style={{ color: '#10b981' }}>{getTotalCartPrice().toLocaleString()} FCFA</Text></Text>
              <TouchableOpacity 
                style={styles.checkoutBtn}
                onPress={() => {
                  const summary = cart.map(i => `${i.quantity}x ${i.title}`).join('\n');
                  const msg = `Bonjour, je souhaite commander :\n${summary}\nTotal : ${getTotalCartPrice().toLocaleString()} FCFA`;
                  Linking.openURL(`whatsapp://send?phone=+22890000000&text=${encodeURIComponent(msg)}`);
                }}
              >
                <Text style={styles.checkoutBtnText}>💳 Passer au Paiement / WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal Admin Login */}
      <Modal visible={showAdminLogin} transparent animationType="fade" onRequestClose={() => setShowAdminLogin(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.loginCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.loginTitle, { color: theme.text }]}>🔒 Code Secret Admin</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              placeholder="Mot de passe"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={inputPassword}
              onChangeText={setInputPassword}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAdminLogin}>
              <Text style={styles.primaryBtnText}>Accéder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdminLogin(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Ajout/Edition Produit */}
      <Modal visible={showProductModal} animationType="slide" onRequestClose={() => setShowProductModal(false)}>
        <SafeAreaView style={[styles.modalDarkContainer, { backgroundColor: theme.bg }]}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={[styles.modalMainTitle, { color: theme.text }]}>Mettre un article en vente</Text>
            <Text style={styles.modalSubTitle}>3 photos + 1 Vidéo de présentation (1 min max)</Text>

            <Text style={styles.sectionLabel}>Médias (3 Photos + 1 Vidéo)</Text>
            <View style={styles.photoGrid}>
              {[0, 1, 2].map((index) => (
                <View key={index} style={styles.photoBoxContainer}>
                  {images[index] ? (
                    <View style={styles.photoBoxFilled}>
                      <Image source={{ uri: images[index] }} style={styles.photoBoxImage} />
                      <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(index)}>
                        <Text style={styles.deleteBadgeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={[styles.photoBoxDashed, { backgroundColor: theme.cardBg }]} onPress={() => pickImage(index)}>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.cameraText}>Photo {index + 1}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <View style={styles.photoBoxContainer}>
                {video ? (
                  <View style={styles.photoBoxFilled}>
                    <Video source={{ uri: video }} style={styles.photoBoxImage} resizeMode="cover" shouldPlay={false} />
                    <TouchableOpacity style={styles.deleteBadge} onPress={removeVideo}>
                      <Text style={styles.deleteBadgeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.photoBoxDashedVideo, { backgroundColor: theme.cardBg }]} onPress={pickVideo}>
                    <Text style={styles.cameraIcon}>🎥</Text>
                    <Text style={styles.videoBoxText}>Vidéo (1 min)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Titre de l'article *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Ex: iPhone 13 Pro" placeholderTextColor="#6b7280" value={title} onChangeText={setTitle} />

            <Text style={[styles.label, { color: theme.text }]}>Prix (FCFA) *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Ex: 250000" placeholderTextColor="#6b7280" keyboardType="numeric" value={price} onChangeText={setPrice} />

            <Text style={[styles.label, { color: theme.text }]}>Catégorie *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Ex: Électronique" placeholderTextColor="#6b7280" value={category} onChangeText={setCategory} />

            <Text style={[styles.label, { color: theme.text }]}>Contact / WhatsApp</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Ex: +228 90000000" placeholderTextColor="#6b7280" keyboardType="phone-pad" value={contact} onChangeText={setContact} />

            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 80 }]} placeholder="État, marque..." placeholderTextColor="#6b7280" multiline value={description} onChangeText={setDescription} />

            <Text style={[styles.label, { color: theme.text }]}>Localisation</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Ex: Lomé" placeholderTextColor="#6b7280" value={location} onChangeText={setLocation} />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveProduct}>
              <Text style={styles.primaryBtnText}>💾 Enregistrer l'article</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProductModal(false)}>
              <Text style={styles.cancelBtnText}>Fermer</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Client : Fiche Produit avec Défilement Tactile (SWIPE) */}
      {selectedProduct && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedProduct(null)}>
          <SafeAreaView style={[styles.modalDarkContainer, { backgroundColor: theme.bg }]}>
            <ScrollView style={{ padding: 15 }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                <Text style={styles.closeBtnText}>✕ Fermer</Text>
              </TouchableOpacity>

              {/* CAROUSEL AVEC SWIPE PAR GLISSEMENT DU DOIGT */}
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                style={styles.swipeCarousel}
                onScroll={(e) => {
                  const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                  if (slide !== activeMediaIndex) setActiveMediaIndex(slide);
                }}
              >
                {selectedProduct.images.map((img, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => setShowZoomModal(true)}>
                    <Image source={{ uri: img }} style={styles.mainImageSwipe} />
                  </TouchableOpacity>
                ))}
                {selectedProduct.video ? (
                  <View style={styles.mainImageSwipe}>
                    <Video source={{ uri: selectedProduct.video }} style={{ width: '100%', height: '100%', borderRadius: 12 }} useNativeControls resizeMode="contain" />
                  </View>
                ) : null}
              </ScrollView>

              <Text style={styles.zoomText}>👈 Glisser pour voir les photos • Toucher pour zoomer 🔍</Text>

              <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedProduct.title}</Text>
              <Text style={styles.detailPrice}>{selectedProduct.price.toLocaleString()} FCFA</Text>
              {selectedProduct.location ? <Text style={styles.detailLocation}>📍 {selectedProduct.location}</Text> : null}

              <Text style={[styles.detailDescHeader, { color: theme.text }]}>Description :</Text>
              <Text style={styles.detailDesc}>{selectedProduct.description || "Aucune description."}</Text>

              {/* BOUTONS D'ACTION : AJOUTER AU PANIER & COMMANDER */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 25 }}>
                <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(selectedProduct)}>
                  <Text style={styles.addToCartBtnText}>🛒 Ajouter au panier</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.buyBtnFlex} 
                  onPress={() => {
                    if (selectedProduct.contact) {
                      Linking.openURL(`whatsapp://send?phone=${selectedProduct.contact}&text=Bonjour, je souhaite commander : ${selectedProduct.title}`);
                    } else {
                      Alert.alert("Acheter", "Commander cet article directement.");
                    }
                  }}
                >
                  <Text style={styles.buyBtnText}>⚡ Commander</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* MODAL ZOOM NATIVE : PINCH TO ZOOM + GLISSEMENT TOTAL (HAUT/BAS/GAUCHE/DROITE) */}
      {showZoomModal && selectedProduct && (
        <Modal visible={true} transparent onRequestClose={() => setShowZoomModal(false)}>
          <ImageViewer
            imageUrls={zoomImagesFormatted}
            index={activeMediaIndex < selectedProduct.images.length ? activeMediaIndex : 0}
            enableSwipeDown
            onSwipeDown={() => setShowZoomModal(false)}
            onClick={() => setShowZoomModal(false)}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 20 },
  logoBold: { fontWeight: 'bold' },
  logoGold: { color: '#f59e0b', fontWeight: 'bold' },
  themeToggleBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  adminBadgeText: { color: '#9ca3af', fontSize: 12 },
  cartHeaderBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  cartBadge: { backgroundColor: '#ef4444', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -5, right: -5 },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  searchInput: { borderRadius: 8, padding: 10, fontSize: 14, borderWidth: 1 },
  addButton: { backgroundColor: '#f59e0b', margin: 15, padding: 14, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  catalog: { flex: 1, paddingHorizontal: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  emptySub: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  productImage: { width: '100%', height: 140, backgroundColor: '#374151' },
  productInfo: { padding: 10 },
  productCategory: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold' },
  productTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  productPrice: { color: '#10b981', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  adminActions: { flexDirection: 'row', borderTopWidth: 1 },
  editBtn: { flex: 1, padding: 8, alignItems: 'center' },
  editBtnText: { color: '#60a5fa', fontSize: 12 },
  deleteBtn: { padding: 8, paddingHorizontal: 12, backgroundColor: '#7f1d1d' },
  deleteBtnText: { color: '#fff' },
  modalDarkContainer: { flex: 1 },
  modalMainTitle: { fontSize: 22, fontWeight: 'bold' },
  modalSubTitle: { color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 20 },
  sectionLabel: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoBoxContainer: { width: '48%', aspectRatio: 1.3, marginBottom: 12 },
  photoBoxDashed: { flex: 1, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#f59e0b', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  photoBoxDashedVideo: { flex: 1, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#60a5fa', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 26 },
  cameraText: { color: '#f59e0b', fontSize: 12, marginTop: 4, fontWeight: '600' },
  videoBoxText: { color: '#60a5fa', fontSize: 12, marginTop: 4, fontWeight: '600' },
  photoBoxFilled: { flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  photoBoxImage: { width: '100%', height: '100%' },
  deleteBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  deleteBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  loginCard: { padding: 20, borderRadius: 12 },
  loginTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 10 },
  closeBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  swipeCarousel: { height: 280, borderRadius: 12 },
  mainImageSwipe: { width: width - 30, height: 280, borderRadius: 12, backgroundColor: '#1f2937' },
  zoomText: { color: '#9ca3af', textAlign: 'center', fontSize: 12, marginTop: 8 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  detailPrice: { color: '#10b981', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  detailLocation: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  detailDescHeader: { fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  detailDesc: { color: '#9ca3af', fontSize: 14, marginTop: 4, lineHeight: 20 },
  addToCartBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 10, alignItems: 'center' },
  addToCartBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  buyBtnFlex: { flex: 1, backgroundColor: '#10b981', padding: 16, borderRadius: 10, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cartItemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  cartItemThumb: { width: 50, height: 50, borderRadius: 8 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: '#374151', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: '#fff', fontWeight: 'bold' },
  cartFooter: { borderTopWidth: 1, borderColor: '#374151', paddingTop: 15, marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  checkoutBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 10, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
