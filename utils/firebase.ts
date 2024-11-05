// firebase.ts

import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const auth = initializeAuth(firebase, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Função para adicionar um anúncio
export const addAnuncio = async (title: string, description: string, preco: number, fotos: string[], userId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'anuncio'), {
      title,
      description,
      preco,
      fotos,
      userId,
    });
    console.log('Anúncio adicionado com ID:', docRef.id);
  } catch (e) {
    console.error('Erro ao adicionar anúncio:', e);
  }
};

// Função para buscar todos os anúncios
export const getAllAnuncios = async () => {
  const anuncioRef = collection(db, 'anuncio');
  const querySnapshot = await getDocs(anuncioRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Função para buscar anúncios de um usuário específico
export const getUserAnuncios = async (userId: string) => {
  const anuncioRef = collection(db, 'anuncio');
  const q = query(anuncioRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Função para obter um anúncio específico pelo ID
export const getAnuncio = async (anuncioId: string) => {
  const anuncioRef = doc(db, 'anuncio', anuncioId);
  const anuncioDoc = await getDoc(anuncioRef);

  return anuncioDoc.exists() ? { id: anuncioDoc.id, ...anuncioDoc.data() } : null;
};

// Função para atualizar um anúncio pelo ID
export const updateAnuncio = async (anuncioId: string, updatedData: any) => {
  try {
    const anuncioRef = doc(db, 'anuncio', anuncioId);
    await updateDoc(anuncioRef, updatedData);
    console.log('Anúncio atualizado com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar o anúncio:', error);
  }
};

// Função para excluir um anúncio pelo ID
export const deleteAnuncio = async (anuncioId: string) => {
  try {
    const anuncioRef = doc(db, 'anuncio', anuncioId);
    await deleteDoc(anuncioRef);
    console.log('Anúncio excluído com sucesso.');
  } catch (error) {
    console.error('Erro ao excluir o anúncio:', error);
  }
};

// Função para registrar dados adicionais do usuário
export const registerUserData = async (userId: string, name: string, telefone: string, endereco: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { name, telefone, endereco });
    console.log('Dados do usuário registrados com sucesso.');
  } catch (error) {
    console.error('Erro ao registrar dados do usuário:', error);
  }
};

export const getAnunciosWithUserEmails = async () => {
  const anunciosSnapshot = await getDocs(collection(db, 'anuncio'));
  const anuncios = [];

  for (const docAnuncio of anunciosSnapshot.docs) {
    const anuncioData = docAnuncio.data();
    const userDoc = await getDoc(doc(db, 'users', anuncioData.userId));

    anuncios.push({
      id: docAnuncio.id,
      ...anuncioData,
      email: userDoc.exists() ? userDoc.data().email : 'E-mail não disponível',
      name: userDoc.data()?.name || '',
      endereco: userDoc.data()?.endereco || '',
      telefone: userDoc.data()?.telefone || '',
    });
  }

  return anuncios;
};

// Exporta auth e db
export { auth, db };
