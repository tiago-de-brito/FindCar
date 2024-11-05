// modal.tsx

import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';

export default function Modal() {
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert(
      'Confirmação de Logout',
      'Tem certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/'); // Redireciona para a tela de login sem histórico de navegação
  };

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações do Usuário</Text>
      
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.infoText}>Email: {user.email}</Text>
          <Text style={styles.infoText}>ID do Usuário: {user.uid}</Text>
        </View>
      ) : (
        <Text style={styles.infoText}>Nenhum usuário autenticado</Text>
      )}

      <View style={styles.logoutButtonContainer}>
        <Button title="Sair" onPress={confirmLogout} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
