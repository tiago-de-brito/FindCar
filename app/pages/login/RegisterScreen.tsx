// RegisterScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db, registerUserData } from '../../../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Salvar dados adicionais do usuário no Firestore
      await registerUserData(userId, name, telefone, endereco);

      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      router.push('/'); // Redireciona para a tela de login
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
    }
  };
  const saveUserData = async (userId: string, email: string, name: string, endereco: string, telefone: string) => {
    await setDoc(doc(db, 'users', userId), {
      email,
      name,
      endereco,
      telefone,
    });
  };
  return (
    <View>
      <Text>Cadastro</Text>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} />
      <TextInput placeholder="Telefone" value={telefone} onChangeText={setTelefone} />
      <TextInput placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
