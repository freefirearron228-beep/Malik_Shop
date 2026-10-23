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
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  // Mot de passe Administrateur
  const ADMIN_PASSWORD = "1234"; // ⚠️ Change ce mot de passe par le tien !

  // États de l'application
  const [products, setProducts] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // États pour la création / modification de produit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState(['', '', '', '', '']); // Jusqu'à 5 photos

  // États pour la vue détaillée / zoom client
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Connexion Admin
  const handleAdminLogin = () => {
    if (inputPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setInputPassword('');
      Alert.alert("Succès", "Vous êtes connecté en tant qu'Administrateur !");
    } else {
      Alert.alert("Erreur", "Mot de passe incorrect.");
    }
  };

  // Ouvrir le formulaire d'ajout/modification
  const openProductForm = (product = null) => {
    if (product) {
      setEditingProductId(product.id);
      setTitle(product.title);
      setPrice(product.price.toString());
      setCategory(product.category);
      setDescription(product.description || '');
      const imgs = [...product.images];
      while (imgs.length < 5) imgs.push('');
      setImages(imgs);
    } else {
      setEditingProductId(null);
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImages(['', '', '', '', '']);
    }
    setShowProductModal(true);
  };

  // Sauvegarder un produit
  const saveProduct = () => {
    if (!title || !price || !category) {
      Alert.alert("Champs requis", "Veuillez remplir au moins le titre, le prix et la catégorie.");
      return;
    }

    const filteredImages = images.filter(url => url.trim() !== '');

    if (editingProductId) {
      setProducts(products.map(p => p.id === editingProductId ? {
        ...p,
        title,
        price: parseFloat(price),
        category,
        description,
        images: filteredImages.length > 0 ? filteredImages : ['https://via.placeholder.com/300']
      } : p));
    } else {
      const newProduct = {
        id: Date.now().toString(),
        title,
        price: parseFloat(price),
        category,
        description,
        images: filteredImages.length > 0 ? filteredImages : ['https://via.placeholder.com/300']
      };
      setProducts([...products, newProduct]);
    }

    setShowProductModal(false);
  };

  // Supprimer un produit
  const deleteProduct = (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer ce produit ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => setProducts(products.filter(p => p.id !== id)) }
      ]
    );
  };

  // Filtrage recherche
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Malik Shop</Text>
        <Text style={styles.headerSubtitle}>La qualité à portée de main</Text>

        <TouchableOpacity 
          style={styles.adminBadge}
          onPress={() => isAdminLoggedIn ? setIsAdminLoggedIn(false) : setShowAdminLogin(true)}
        >
          <Text style={styles.adminBadgeText}>
            {isAdminLoggedIn ? "🔓 Mode Admin (Déconnexion)" : "🔒 Espace Admin"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit ou catégorie..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Bouton d'ajout Admin */}
      {isAdminLoggedIn && (
        <TouchableOpacity style={styles.addButton} onPress={() => openProductForm()}>
          <Text style={styles.addButtonText}>➕ Ajouter un nouveau produit</Text>
        </TouchableOpacity>
      )}

      {/* Liste du catalogue */}
      <ScrollView style={styles.catalog}>
        {filteredProducts.length === 0 ? (
          <Text style={styles.emptyText}>Aucun produit disponible pour le moment.</Text>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity onPress={() => { setSelectedProduct(product); setActiveImageIndex(0); }}>
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  <View style={styles.productDetails}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price} FCFA</Text>
                  </View>
                </TouchableOpacity>

                {/* Options d'édition Admin */}
                {isAdminLoggedIn && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openProductForm(product)}>
                      <Text style={styles.btnText}>✏️ Éditer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(product.id)}>
                      <Text style={styles.btnText}>🗑️ Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL : Login Admin */}
      <Modal visible={showAdminLogin} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔒 Connexion Administrateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry
              value={inputPassword}
              onChangeText={setInputPassword}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdminLogin}>
              <Text style={styles.saveBtnText}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdminLogin(false)}>
              <Text style={styles.cancelBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL : Formulaire Produit (Admin) */}
      <Modal visible={showProductModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>
              {editingProductId ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
            </Text>

            <TextInput style={styles.input} placeholder="Titre du produit" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Prix (FCFA)" keyboardType="numeric" value={price} onChangeText={setPrice} />
            <TextInput style={styles.input} placeholder="Catégorie (ex: Vêtements, Chaussures)" value={category} onChangeText={setCategory} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" multiline value={description} onChangeText={setDescription} />

            <Text style={styles.sectionHeader}>📷 Liens des photos (jusqu'à 5) :</Text>
            {images.map((img, idx) => (
              <TextInput
                key={idx}
                style={styles.input}
                placeholder={`URL Photo ${idx + 1}`}
                value={img}
                onChangeText={(text) => {
                  const updated = [...images];
                  updated[idx] = text;
                  setImages(updated);
                }}
              />
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}>
              <Text style={styles.saveBtnText}>Enregistrer le produit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProductModal(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL : Fiche Produit Client + Galerie 5 photos */}
      {selectedProduct && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView style={{ padding: 15 }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                <Text style={styles.closeBtnText}>✕ Fermer</Text>
              </TouchableOpacity>

              {/* Photo Principale avec ouverture Zoom */}
              <TouchableOpacity onPress={() => setShowZoomModal(true)}>
                <Image
                  source={{ uri: selectedProduct.images[activeImageIndex] }}
                  style={styles.largeProductImage}
                />
                <Text style={styles.zoomHint}>🔍 Clic pour agrandir la photo</Text>
              </TouchableOpacity>

              {/* Miniatures des 5 photos */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {selectedProduct.images.map((img, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setActiveImageIndex(idx)}>
                    <Image
                      source={{ uri: img }}
                      style={[
                        styles.thumbnail,
                        activeImageIndex === idx && styles.activeThumbnail
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.productDetailsTitle}>{selectedProduct.title}</Text>
              <Text style={styles.productDetailsPrice}>{selectedProduct.price} FCFA</Text>
              <Text style={styles.productDetailsCategory}>Catégorie : {selectedProduct.category}</Text>
              <Text style={styles.productDetailsDesc}>{selectedProduct.description}</Text>

              {/* Bouton Acheter / Payer */}
              <TouchableOpacity style={styles.buyBtn} onPress={() => Alert.alert("Paiement", "Redirection vers le paiement...")}>
                <Text style={styles.buyBtnText}>💳 Payer / Commander</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* MODAL : Zoom Photo en Plein Écran */}
      {showZoomModal && selectedProduct && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.fullScreenOverlay}>
            <TouchableOpacity style={styles.fullScreenClose} onPress={() => setShowZoomModal(false)}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕ Fermer le zoom</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedProduct.images[activeImageIndex] }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#1a202c', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#a0aec0', fontSize: 14, marginTop: 4 },
  adminBadge: { marginTop: 10, backgroundColor: '#2d3748', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  adminBadgeText: { color: '#cbd5e0', fontSize: 12 },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderColor: '#e2e8f0', borderWidth: 1 },
  addButton: { backgroundColor: '#38a169', marginHorizontal: 15, marginBottom: 10, padding: 14, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  catalog: { flex: 1, paddingHorizontal: 15 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#a0aec0' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { backgroundColor: '#fff', width: '48%', borderRadius: 8, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  productImage: { width: '100%', height: 140 },
  productDetails: { padding: 10 },
  productCategory: { fontSize: 10, color: '#718096', textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#38a169', marginTop: 4 },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#edf2f7' },
  editBtn: { flex: 1, padding: 8, backgroundColor: '#edf2f7', alignItems: 'center' },
  deleteBtn: { flex: 1, padding: 8, backgroundColor: '#fed7d7', alignItems: 'center' },
  btnText: { fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, marginBottom: 12 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', marginVertical: 8 },
  saveBtn: { backgroundColor: '#3182ce', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 5 },
  cancelBtnText: { color: '#e53e3e' },
  closeBtn: { alignSelf: 'flex-end', padding: 10 },
  closeBtnText: { fontSize: 16, fontWeight: 'bold', color: '#e53e3e' },
  largeProductImage: { width: '100%', height: 280, borderRadius: 8 },
  zoomHint: { textAlign: 'center', color: '#718096', fontSize: 12, marginVertical: 5 },
  thumbnail: { width: 60, height: 60, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  activeThumbnail: { borderColor: '#3182ce', borderWidth: 2 },
  productDetailsTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  productDetailsPrice: { fontSize: 20, fontWeight: 'bold', color: '#38a169', marginVertical: 5 },
  productDetailsCategory: { fontSize: 14, color: '#718096' },
  productDetailsDesc: { fontSize: 14, color: '#4a5568', marginTop: 10, lineHeight: 20 },
  buyBtn: { backgroundColor: '#38a169', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  fullScreenOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullScreenClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullScreenImage: { width, height: width }
});
