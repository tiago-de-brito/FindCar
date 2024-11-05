import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Switch, Button, Alert, StyleSheet, BackHandler, Image } from 'react-native';
import { getAllAnuncios, deleteAnuncio, auth, db, getAnunciosWithUserEmails } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface Anuncio {
  id: string;
  title: string;
  description: string;
  preco: number;
  fotos: string[];
  userId: string;
  endereco: string;
  telefone: string;
  email: string;
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [showOwnAnuncios, setShowOwnAnuncios] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchAnuncios = async () => {
    const user = auth.currentUser;
    if (user) {
      const allAnunciosRaw = await getAnunciosWithUserEmails();

      const allAnuncios: Anuncio[] = await Promise.all(
        allAnunciosRaw.map(async (anuncio: Partial<Anuncio>) => {
          const userDoc = await getDoc(doc(db, 'users', anuncio.userId || ''));
          const userData = userDoc.exists() ? userDoc.data() : {};
          console.log(userData, 'AQUIIIIIIIIIIII');
          console.log(anuncio);
          return {
            id: anuncio.id || '',
            title: anuncio.title || 'Título não disponível',
            description: anuncio.description || 'Descrição não disponível',
            preco: anuncio.preco || 0,
            fotos: anuncio.fotos || [],
            userId: anuncio.userId || '',
            endereco: userData.endereco || 'Endereço não disponível',
            telefone: userData.telefone || 'Telefone não disponível',
            email: userData.email || 'E-mail não disponível',
          } as Anuncio;
        })
      );

      const userAnuncios = allAnuncios.filter((anuncio) => anuncio.userId === user.uid);
      const otherAnuncios = allAnuncios.filter((anuncio) => anuncio.userId !== user.uid);

      setAnuncios(showOwnAnuncios ? [...userAnuncios, ...otherAnuncios] : otherAnuncios);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAnuncios();

      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [showOwnAnuncios])
  );

  const toggleSwitch = () => setShowOwnAnuncios((prev) => !prev);

  const handleDeleteAnuncio = (anuncioId: string) => {
    Alert.alert('Excluir Anúncio', 'Tem certeza de que deseja excluir este anúncio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteAnuncio(anuncioId);
          fetchAnuncios();
        },
      },
    ]);
  };

  const handleEditAnuncio = (anuncio: Anuncio) => {
    router.push({
      pathname: '/pages/editNotes/EditNoteScreen',
      params: { anuncioId: anuncio.id },
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text>Mostrar meus anúncios</Text>
        <Switch value={showOwnAnuncios} onValueChange={toggleSwitch} />
      </View>
      {loading ? (
        <Text>Carregando...</Text>
      ) : anuncios.length === 0 ? (
        <Text>Não há anúncios cadastrados.</Text>
      ) : (
        <FlatList
          data={anuncios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.anuncioContainer}>
              <Text style={styles.anuncioTitle}>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text>Preço: R$ {item.preco.toFixed(2)}</Text>
              <Text>Endereço: {item.endereco}</Text>
              <Text>Telefone: {item.telefone}</Text>
              <View style={styles.fotosContainer}>
                {item.fotos.map((foto, index) => (
                  <Image key={index} source={{ uri: foto }} style={styles.foto} />
                ))}
              </View>
              {item.userId === auth.currentUser?.uid && (
                <View style={styles.buttonContainer}>
                  <Button title="Editar" onPress={() => handleEditAnuncio(item)} />
                  <Button title="Excluir" color="red" onPress={() => handleDeleteAnuncio(item.id)} />
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  anuncioContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  anuncioTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  foto: {
    width: 80,
    height: 80,
    marginRight: 5,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
