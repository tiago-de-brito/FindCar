import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState, useCallback  } from 'react';
import { View, Text, TextInput, Button, Alert, BackHandler  } from 'react-native';

import { auth } from '../utils/firebase'; // Certifique-se de ajustar o caminho

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Impede voltar para a tela anterior após o logout
        Alert.alert('Ação bloqueada', 'Você precisa se autenticar para acessar outras telas.');
        return true; // Retorna true para bloquear a navegação "Voltar"
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsAuthenticated(true);
        router.push('./home'); // Redireciona para a home se o usuário já estiver autenticado
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userToken', userCredential.user.uid);
      setIsAuthenticated(true);
      router.push('./home');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
      <Button title="Cadastrar-se" onPress={() => router.push('/pages/login/RegisterScreen')} />
    </View>
  );
};

export default LoginScreen;
