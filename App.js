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
  const [images, setImages] = useState([]); // Tableau des URI d'images de la galerie

  // Modal Vue Client + Zoom
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Fonction pour sélectionner une image dans la galerie Android
  const pickImage = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour choisir une photo.");
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
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleAdminLogin = () => {
    if (inputPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setInputPassword('');
      Alert.alert("Succès", "Espace Administrateur déverrouillé !");
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
      setImages([...product.images]);
    } else {
      setEditingProductId(null);
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImages([]);
    }
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!title || !price || !category) {
      Alert.alert("Champs manquants", "Veuillez remplir au moins le titre, le prix et la catégorie.");
      return;
    }

    const finalImages = images.length > 0 ? images : ['https://via.placeholder.com/400?text=Pas+d+image'];

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? {
        ...p,
        title,
        price: parseFloat(price),
        category,
        description,
        images: finalImages
      } : p));
    } else {
      const newProduct = {
        id: Date.now().toString(),
        title,
        price: parseFloat(price),
        category,
        description,
        images: finalImages
      };
      setProducts([...products, newProduct]);
    }

    setShowProductModal(false);
  };

  const deleteProduct = (id) => {
    Alert.alert(
      "Suppression",
      "Voulez-vous vraiment supprimer cet article ?",
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
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* En-tête Premium */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Malik Shop</Text>
        <Text style={styles.headerSubtitle}>Boutique Officielle</Text>

        <TouchableOpacity 
          style={styles.adminBadge}
          onPress={() => isAdminLoggedIn ? setIsAdminLoggedIn(false) : setShowAdminLogin(true)}
        >
          <Text style={styles.adminBadgeText}>
            {isAdminLoggedIn ? "🔓 Mode Admin (Déconnexion)" : "🔒 Espace Admin"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Rechercher un produit, une catégorie..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Bouton Ajouter Produit Admin */}
      {isAdminLoggedIn && (
        <TouchableOpacity style={styles.addButton} onPress={() => openProductForm()}>
          <Text style={styles.addButtonText}>✨ Ajouter un nouveau produit</Text>
        </TouchableOpacity>
      )}

      {/* Catalogue Produit */}
      <ScrollView style={styles.catalog} showsVerticalScrollIndicator={false}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Catalogue vide</Text>
            <Text style={styles.emptySub}>Aucun produit disponible pour le moment.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedProduct(product); setActiveImageIndex(0); }}>
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

      {/* MODAL Login Admin */}
      <Modal visible={showAdminLogin} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>🔒 Accès Administrateur</Text>
            <Text style={styles.loginSub}>Saisissez votre mot de passe pour gérer le catalogue</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry
              value={inputPassword}
              onChangeText={setInputPassword}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAdminLogin}>
              <Text style={styles.primaryBtnText}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowAdminLogin(false)}>
              <Text style={styles.secondaryBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL Nouveau / Édition Produit (Carrés Galerie) */}
      <Modal visible={showProductModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>
              {editingProductId ? "✏️ Modifier l'article" : "➕ Ajouter un article"}
            </Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.label}>Titre du produit</Text>
            <TextInput style={styles.input} placeholder="Ex: T-Shirt Malik Premium" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Prix (FCFA)</Text>
            <TextInput style={styles.input} placeholder="Ex: 15000" keyboardType="numeric" value={price} onChangeText={setPrice} />

            <Text style={styles.label}>Catégorie</Text>
            <TextInput style={styles.input} placeholder="Ex: Vêtements, Chaussures, Montres" value={category} onChangeText={setCategory} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 90 }]} placeholder="Description détaillée..." multiline value={description} onChangeText={setDescription} />

            {/* Sélection de photos sous forme de 5 carrés d'images */}
            <Text style={styles.label}>Photos du produit (Jusqu'à 5)</Text>
            <Text style={styles.subLabel}>Cliquez sur un carré pour ouvrir votre galerie photos 📱</Text>

            <View style={styles.imagePickerGrid}>
              {[0, 1, 2, 3, 4].map((index) => (
                <View key={index} style={styles.squarePickerContainer}>
                  {images[index] ? (
                    <View style={styles.squarePicker}>
                      <Image source={{ uri: images[index] }} style={styles.squareImage} />
                      <TouchableOpacity style={styles.removeBadge} onPress={() => removeImage(index)}>
                        <Text style={styles.removeBadgeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.squarePickerEmpty} onPress={() => pickImage(index)}>
                      <Text style={styles.cameraIcon}>📸</Text>
                      <Text style={styles.cameraText}>Photo {index + 1}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={saveProduct}>
              <Text style={styles.primaryBtnText}>💾 Enregistrer le produit</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL Vue Produit Client + Galerie & Zoom */}
      {selectedProduct && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderTitle}>{selectedProduct.category}</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 15 }}>
              {/* Photo Principale Grand Format */}
              <TouchableOpacity activeOpacity={0.9} onPress={() => setShowZoomModal(true)}>
                <Image source={{ uri: selectedProduct.images[activeImageIndex] }} style={styles.mainDetailImage} />
                <View style={styles.zoomBadge}>
                  <Text style={styles.zoomBadgeText}>🔍 Cliquer pour zoomer</Text>
                </View>
              </TouchableOpacity>

              {/* Miniatures des 5 photos */}
              {selectedProduct.images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 15 }}>
                  {selectedProduct.images.map((img, idx) => (
                    <TouchableOpacity key={idx} onPress={() => setActiveImageIndex(idx)}>
                      <Image
                        source={{ uri: img }}
                        style={[
                          styles.thumbImage,
                          activeImageIndex === idx && styles.activeThumbImage
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
              <Text style={styles.detailPrice}>{selectedProduct.price.toLocaleString()} FCFA</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.detailDescTitle}>Description :</Text>
              <Text style={styles.detailDesc}>{selectedProduct.description || "Aucune description fournie."}</Text>

              <TouchableOpacity style={styles.buyBtn} onPress={() => Alert.alert("Commander", "Commande envoyée avec succès !")}>
                <Text style={styles.buyBtnText}>🛒 Acheter maintenant</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* MODAL Zoom Plein Écran */}
      {showZoomModal && selectedProduct && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.zoomOverlay}>
            <TouchableOpacity style={styles.zoomCloseBtn} onPress={() => setShowZoomModal(false)}>
              <Text style={styles.zoomCloseText}>✕ Fermer</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedProduct.images[activeImageIndex] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0f172a', padding: 20, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  headerSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  adminBadge: { marginTop: 12, backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  adminBadgeText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  addButton: { backgroundColor: '#2563eb', marginHorizontal: 15, marginBottom: 15, padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  addButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  catalog: { flex: 1, paddingHorizontal: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginTop: 10 },
  emptySub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { backgroundColor: '#ffffff', width: '48%', borderRadius: 16, marginBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  productImage: { width: '100%', height: 150, backgroundColor: '#e2e8f0' },
  productInfo: { padding: 12 },
  productCategory: { fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#16a34a', marginTop: 6 },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#f1f5f9' },
  editBtn: { flex: 1, padding: 10, backgroundColor: '#f8fafc', alignItems: 'center' },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  deleteBtn: { padding: 10, paddingHorizontal: 15, backgroundColor: '#fef2f2', alignItems: 'center' },
  deleteBtnText: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { backgroundColor: '#ffffff', width: '100%', padding: 25, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  loginTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  loginSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 5, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  subLabel: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 15, color: '#0f172a' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: { padding: 14, alignItems: 'center', marginTop: 5 },
  secondaryBtnText: { color: '#e11d48', fontWeight: '600' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  formHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  closeText: { fontSize: 22, fontWeight: 'bold', color: '#64748b' },
  imagePickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  squarePickerContainer: { width: '30%', aspectRatio: 1 },
  squarePickerEmpty: { flex: 1, backgroundColor: '#e2e8f0', borderRadius: 12, borderWidth: 1.5, borderColor: '#cbd5e1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 24 },
  cameraText: { fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '600' },
  squarePicker: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  squareImage: { width: '100%', height: '100%' },
  removeBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(225, 29, 72, 0.9)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  removeBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  mainDetailImage: { width: '100%', height: 320, borderRadius: 16, backgroundColor: '#e2e8f0' },
  zoomBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  zoomBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  thumbImage: { width: 65, height: 65, borderRadius: 10, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  activeThumbImage: { borderColor: '#2563eb' },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 10 },
  detailPrice: { fontSize: 22, fontWeight: '800', color: '#16a34a', marginTop: 6 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  detailDescTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  detailDesc: { fontSize: 14, color: '#64748b', marginTop: 6, lineHeight: 22 },
  buyBtn: { backgroundColor: '#16a34a', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 25 },
  buyBtnText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  zoomOverlay: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  zoomCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  zoomCloseText: { color: '#ffffff', fontWeight: 'bold' },
  fullImage: { width, height: width * 1.2 }
});
