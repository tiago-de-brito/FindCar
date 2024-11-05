// CadastrarAnuncioScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

interface Anuncio {
  title: string;
  description: string;
  preco: number;
  fotos: string[];
}

const CadastrarAnuncioScreen: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preco, setPreco] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  const handleCadastrarAnuncio = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const anuncioData: Anuncio = {
        title,
        description,
        preco: parseFloat(preco),
        fotos,
      };

      await addDoc(collection(db, 'anuncio'), {
        ...anuncioData,
        userId: user.uid,
      });

      Alert.alert('Sucesso', 'Anúncio cadastrado com sucesso!');
      router.push('/home'); // Redireciona para a tela Home
    } catch (error) {
      console.error('Erro ao cadastrar anúncio:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o anúncio.');
    }
  };

  const handleSelecionarFotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedFotos = result.assets?.map((asset) => asset.uri) || [];
      setFotos((prevFotos) => [...prevFotos, ...selectedFotos].slice(0, 5)); // Limite de até 5 fotos
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Anúncio</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={preco}
        onChangeText={setPreco}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.photoButton} onPress={handleSelecionarFotos}>
        <Text style={styles.photoButtonText}>Selecionar Fotos</Text>
      </TouchableOpacity>
      <View style={styles.fotosContainer}>
        {fotos.map((foto, index) => (
          <Image key={index} source={{ uri: foto }} style={styles.foto} />
        ))}
      </View>
      <Button title="Cadastrar Anúncio" onPress={handleCadastrarAnuncio} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  photoButton: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  foto: {
    width: 80,
    height: 80,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default CadastrarAnuncioScreen;
