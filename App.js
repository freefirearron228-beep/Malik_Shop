import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  ScrollView, 
  Linking,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Vos produits (Exemples de démarrage)
const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'T-Shirt Malik Shop Original',
    price: '5 000 FCFA',
    category: 'Vêtements',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    description: 'T-shirt 100% coton, confort et style assurés.',
  },
  {
    id: '2',
    name: 'Chaussures Sneakers Pro',
    price: '18 000 FCFA',
    category: 'Chaussures',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    description: 'Sneakers tendance pour un look moderne et dynamique.',
  },
  {
    id: '3',
    name: 'Casque Audio Sans Fil',
    price: '12 000 FCFA',
    category: 'Électronique',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: 'Son haute définition avec réduction de bruit.',
  },
  {
    id: '4',
    name: 'Montre Elegance',
    price: '15 000 FCFA',
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    description: 'Montre élégante adaptée à toutes les occasions.',
  },
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Remplacez par votre vrai numéro WhatsApp (ex: +22890000000)
  const PHONE_NUMBER = '+22800000000';

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const orderOnWhatsApp = (product) => {
    const message = `Bonjour Malik Shop ! Je souhaite commander le produit : *${product.name}* (Prix : ${product.price}). Est-il toujours disponible ?`;
    const url = `whatsapp://send?phone=${PHONE_NUMBER}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur votre téléphone.');
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* En-tête / Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Malik Shop</Text>
        <Text style={styles.headerSubtitle}>La qualité à portée de main</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit ou catégorie..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Vue Détails du Produit sélectionné */}
      {selectedProduct ? (
        <ScrollView style={styles.detailContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProduct(null)}>
            <Text style={styles.backButtonText}>⬅️ Retour à la boutique</Text>
          </TouchableOpacity>

          <Image source={{ uri: selectedProduct.image }} style={styles.detailImage} />
          
          <View style={styles.detailInfo}>
            <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
            <Text style={styles.detailName}>{selectedProduct.name}</Text>
            <Text style={styles.detailPrice}>{selectedProduct.price}</Text>
            
            <Text style={styles.descriptionTitle}>Description :</Text>
            <Text style={styles.detailDescription}>{selectedProduct.description}</Text>

            <TouchableOpacity 
              style={styles.orderButton}
              onPress={() => orderOnWhatsApp(selectedProduct)}
            >
              <Text style={styles.orderButtonText}>📱 Commander via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* Liste des produits sous forme de grille */
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => setSelectedProduct(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 45,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listContainer: {
    paddingHorizontal: 6,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardInfo: {
    padding: 10,
  },
  cardCategory: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginVertical: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  detailContainer: {
    flex: 1,
    padding: 15,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  detailInfo: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },
  detailCategory: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 5,
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 15,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 5,
  },
  detailDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  orderButton: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
    
