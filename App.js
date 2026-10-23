import React, { useState } from 'react';
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
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function App() {
  const ADMIN_PASSWORD = "1234";

  const [products, setProducts] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Formulaire Produit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState(['', '', '', '']); // 4 Photos Max

  // Client Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Choisir photo depuis la galerie
  const pickImage = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Accès à la galerie nécessaire pour choisir une photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const newImages = [...images];
      newImages[index] = selectedUri;
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

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
      const imgs = [...product.images];
      while (imgs.length < 4) imgs.push('');
      setImages(imgs);
    } else {
      setEditingProductId(null);
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setLocation('');
      setImages(['', '', '', '']);
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

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? {
        ...p,
        title,
        price: parseFloat(price),
        category,
        description,
        location,
        images: finalImages
      } : p));
    } else {
      const newProduct = {
        id: Date.now().toString(),
        title,
        price: parseFloat(price),
        category,
        description,
        location,
        images: finalImages
      };
      setProducts([...products, newProduct]);
    }

    setShowProductModal(false);
  };

  const deleteProduct = (id) => {
    Alert.alert(
      "Suppression",
      "Voulez-vous supprimer cet article ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => setProducts(products.filter(p => p.id !== id)) }
      ]
    );
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* En-Tête MalikShop Style Dark Mode */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>🛒 <Text style={styles.logoBold}>Malik</Text><Text style={styles.logoGold}>Shop</Text></Text>
          <TouchableOpacity 
            style={styles.adminBadge}
            onPress={() => isAdminLoggedIn ? setIsAdminLoggedIn(false) : setShowAdminLogin(true)}
          >
            <Text style={styles.adminBadgeText}>
              {isAdminLoggedIn ? "🔓 Admin (Déconnexion)" : "🔒 Admin"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barre de Recherche */}
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Bouton Mettre en Vente pour Admin */}
      {isAdminLoggedIn && (
        <TouchableOpacity style={styles.addButton} onPress={() => openProductForm()}>
          <Text style={styles.addButtonText}>➕ Mettre un article en vente</Text>
        </TouchableOpacity>
      )}

      {/* Liste des produits */}
      <ScrollView style={styles.catalog} showsVerticalScrollIndicator={false}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Aucun produit disponible</Text>
            <Text style={styles.emptySub}>Ajoutez vos articles depuis l'espace Admin.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity onPress={() => { setSelectedProduct(product); setActiveImageIndex(0); }}>
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()} FCFA</Text>
                  </View>
                </TouchableOpacity>

                {isAdminLoggedIn && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openProductForm(product)}>
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

      {/* MODAL : Login Admin */}
      <Modal visible={showAdminLogin} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>🔒 Code Secret Admin</Text>
            <TextInput
              style={styles.input}
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

      {/* MODAL : Mettre un article en vente (4 Carrés Photo Pointillés) */}
      <Modal visible={showProductModal} animationType="slide">
        <SafeAreaView style={styles.modalDarkContainer}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.modalMainTitle}>Mettre un article en vente</Text>
            <Text style={styles.modalSubTitle}>Jusqu'à 4 photos • Code secret pour protéger votre annonce</Text>

            {/* PHOTOS DU PRODUIT (1 à 4) */}
            <Text style={styles.sectionLabel}>Photos du produit (1 à 4)</Text>
            
            <View style={styles.photoGrid}>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={styles.photoBoxContainer}>
                  {images[index] ? (
                    <View style={styles.photoBoxFilled}>
                      <Image source={{ uri: images[index] }} style={styles.photoBoxImage} />
                      <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(index)}>
                        <Text style={styles.deleteBadgeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.photoBoxDashed} onPress={() => pickImage(index)}>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.cameraText}>Photo {index + 1}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.infoText}>JPG ou PNG • max 5 Mo par photo</Text>

            {/* FORMULAIRE TEXTE */}
            <Text style={styles.label}>Titre de l'article *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: iPhone 13 Pro 128Go"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Prix (FCFA) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 250000"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Catégorie *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Électronique, Vêtements, Chaussures"
              placeholderTextColor="#6b7280"
              value={category}
              onChangeText={setCategory}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 90 }]}
              placeholder="État, marque, livraison possible..."
              placeholderTextColor="#6b7280"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Localisation</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Lomé, Kara, Sokodé..."
              placeholderTextColor="#6b7280"
              value={location}
              onChangeText={setLocation}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={saveProduct}>
              <Text style={styles.primaryBtnText}>💾 Enregistrer l'article</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProductModal(false)}>
              <Text style={styles.cancelBtnText}>Fermer</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL Client : Voir produit + Zoom 4 photos */}
      {selectedProduct && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={styles.modalDarkContainer}>
            <ScrollView style={{ padding: 15 }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                <Text style={styles.closeBtnText}>✕ Fermer</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowZoomModal(true)}>
                <Image source={{ uri: selectedProduct.images[activeImageIndex] }} style={styles.mainImage} />
                <Text style={styles.zoomText}>🔍 Toucher pour agrandir</Text>
              </TouchableOpacity>

              {/* Miniatures 4 photos */}
              {selectedProduct.images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
                  {selectedProduct.images.map((img, idx) => (
                    <TouchableOpacity key={idx} onPress={() => setActiveImageIndex(idx)}>
                      <Image
                        source={{ uri: img }}
                        style={[styles.thumb, activeImageIndex === idx && styles.activeThumb]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
              <Text style={styles.detailPrice}>{selectedProduct.price.toLocaleString()} FCFA</Text>
              {selectedProduct.location ? <Text style={styles.detailLocation}>📍 {selectedProduct.location}</Text> : null}

              <Text style={styles.detailDescHeader}>Description :</Text>
              <Text style={styles.detailDesc}>{selectedProduct.description || "Aucune description."}</Text>

              <TouchableOpacity style={styles.buyBtn} onPress={() => Alert.alert("Achat", "Contactez le vendeur pour finaliser !")}>
                <Text style={styles.buyBtnText}>🛒 Commander / Payer</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Zoom Fullscreen */}
      {showZoomModal && selectedProduct && (
        <Modal visible={true} transparent>
          <View style={styles.zoomOverlay}>
            <TouchableOpacity style={styles.zoomClose} onPress={() => setShowZoomModal(false)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>✕ Fermer</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedProduct.images[activeImageIndex] }}
              style={styles.zoomImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  header: { backgroundColor: '#111827', padding: 16, borderBottomWidth: 1, borderColor: '#1f2937' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 20, color: '#fff' },
  logoBold: { fontWeight: 'bold' },
  logoGold: { color: '#f59e0b', fontWeight: 'bold' },
  adminBadge: { backgroundColor: '#1f2937', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  adminBadgeText: { color: '#9ca3af', fontSize: 12 },
  searchInput: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 8, padding: 10, fontSize: 14 },
  addButton: { backgroundColor: '#f59e0b', margin: 15, padding: 14, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  catalog: { flex: 1, paddingHorizontal: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  emptySub: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { backgroundColor: '#1f2937', width: '48%', borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
  productImage: { width: '100%', height: 140, backgroundColor: '#374151' },
  productInfo: { padding: 10 },
  productCategory: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold' },
  productTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  productPrice: { color: '#10b981', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#374151' },
  editBtn: { flex: 1, padding: 8, alignItems: 'center', backgroundColor: '#111827' },
  editBtnText: { color: '#60a5fa', fontSize: 12 },
  deleteBtn: { padding: 8, paddingHorizontal: 12, backgroundColor: '#7f1d1d' },
  deleteBtnText: { color: '#fff' },
  modalDarkContainer: { flex: 1, backgroundColor: '#0b0f19' },
  modalMainTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  modalSubTitle: { color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 20 },
  sectionLabel: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoBoxContainer: { width: '48%', aspectRatio: 1.3, marginBottom: 12 },
  photoBoxDashed: { flex: 1, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#f59e0b', borderRadius: 10, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 26 },
  cameraText: { color: '#f59e0b', fontSize: 12, marginTop: 4, fontWeight: '600' },
  photoBoxFilled: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  photoBoxImage: { width: '100%', height: '100%' },
  deleteBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  deleteBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  infoText: { color: '#6b7280', fontSize: 11, marginBottom: 20 },
  label: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  loginCard: { backgroundColor: '#111827', padding: 20, borderRadius: 12 },
  loginTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 10 },
  closeBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  mainImage: { width: '100%', height: 280, borderRadius: 12, backgroundColor: '#1f2937' },
  zoomText: { color: '#9ca3af', textAlign: 'center', fontSize: 12, marginTop: 6 },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#374151' },
  activeThumb: { borderColor: '#f59e0b', borderWidth: 2 },
  detailTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  detailPrice: { color: '#10b981', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  detailLocation: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  detailDescHeader: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  detailDesc: { color: '#9ca3af', fontSize: 14, marginTop: 4, lineHeight: 20 },
  buyBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 25 },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  zoomOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  zoomClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  zoomImage: { width, height: width * 1.2 }
});
