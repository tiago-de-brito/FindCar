// EditAnuncioScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { updateAnuncio, getAnuncio } from '../../../utils/firebase'; // Atualize com sua função para obter e atualizar dados

interface Anuncio {
  title: string;
  description: string;
  preco: number;
  fotos: string[];
  endereco: string;
  telefone: string;
  email: string;
}

const EditAnuncioScreen: React.FC = () => {
  const router = useRouter();
  const { anuncioId } = useGlobalSearchParams();

  const [anuncio, setAnuncio] = useState<Anuncio>({
    title: '',
    description: '',
    preco: 0,
    fotos: [],
    endereco: '',
    telefone: '',
    email: '',
  });

  useEffect(() => {
    const loadAnuncioData = async () => {
      if (anuncioId) {
        const data = await getAnuncio(anuncioId as string);
        if (data) setAnuncio(data as unknown as Anuncio);
      }
    };
    loadAnuncioData();
  }, [anuncioId]);

  const handleSave = async () => {
    try {
      await updateAnuncio(anuncioId as string, anuncio);
      Alert.alert('Sucesso', 'Anúncio atualizado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao salvar o anúncio:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o anúncio.');
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
      setAnuncio((prevAnuncio) => ({
        ...prevAnuncio,
        fotos: [...prevAnuncio.fotos, ...selectedFotos].slice(0, 5), // Limite de até 5 fotos
      }));
    }
  };

  const handleRemoveFoto = (index: number) => {
    setAnuncio((prevAnuncio) => ({
      ...prevAnuncio,
      fotos: prevAnuncio.fotos.filter((_, i) => i !== index),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={anuncio.title}
        onChangeText={(text) => setAnuncio({ ...anuncio, title: text })}
      />

      <Text>Descrição</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Descrição"
        value={anuncio.description}
        onChangeText={(text) => setAnuncio({ ...anuncio, description: text })}
        multiline
      />

      <Text>Preço</Text>
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={anuncio.preco.toString()}
        onChangeText={(text) => setAnuncio({ ...anuncio, preco: parseFloat(text) || 0 })}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.photoButton} onPress={handleSelecionarFotos}>
        <Text style={styles.photoButtonText}>Selecionar Fotos</Text>
      </TouchableOpacity>

      <View style={styles.fotosContainer}>
        {anuncio.fotos.map((foto, index) => (
          <View key={index} style={styles.fotoWrapper}>
            <Image source={{ uri: foto }} style={styles.foto} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFoto(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Salvar" onPress={handleSave} />
        <Button title="Cancelar" onPress={() => router.back()} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    textAlignVertical: 'top',
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
  fotoWrapper: {
    position: 'relative',
    marginRight: 5,
    marginBottom: 5,
  },
  foto: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
});

export default EditAnuncioScreen;
