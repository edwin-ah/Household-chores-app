import React, { useState, useContext } from 'react';
import { Pressable, Text, TextInput, View, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import { db, auth } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Entypo } from '@expo/vector-icons'; 
import tw from 'tailwind-react-native-classnames';

export default function RegisterUser({handleModalClose}) {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = () => {
    setIsLoading(true)
    if(password !== passwordConfirm) {
      setErrorMessage("Lösenorden matchar inte")
      setIsLoading(false)
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((user) => {
      setAuthUser(user.user)
      createUser(user.user.uid)
    })
    .catch((error) => {
      setErrorMessage(error.code)
      setErrorMessage('Ett fel uppstod, det gick inte registrera användaren, kontrollera email.')
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  async function createUser(uid) {
    try{
      await setDoc(doc(db, 'users', uid), {
        name: name,
        email: email,
        house: null
      })
    } catch(err) {
      console.log(err)
      setErrorMessage('Ett fel uppstod, det gick inte spara användaren.')
    }
  }


  return (
    
    <View style={tw.style('relative bg-white h-full w-full')}>
      {isLoading ? 
      (
        <View style={tw.style('h-full bg-white items-center justify-center')}>
          <ActivityIndicator color="#0000ff" size="large" />
        </View>
      ) : (
      <ScrollView style={tw.style('mt-10')}>
        <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
          <Pressable onPress={handleModalClose}>
            <Entypo name="cross" size={24} color="black" />
          </Pressable>
        </View>
        <View style={tw.style('justify-center')}>
          <Text style={tw.style('text-center text-xl font-bold')}>Registrera</Text>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Namn</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='Ange Namn' 
                value={name} 
                onChangeText={(e) => setName(e)}
              />
            </View>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Email</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='Ange Email' 
                value={email} 
                onChangeText={(e) => setEmail(e)}
              />
            </View>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Lösenord</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='Ange Lösenord' 
                secureTextEntry={true}
                value={password} 
                onChangeText={(e) => setPassword(e)}
              />
            </View>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Repetera Lösenord</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='Repetera Lösenord' 
                secureTextEntry={true}
                value={passwordConfirm} 
                onChangeText={(e) => setPasswordConfirm(e)}
              />
            </View>
              {errorMessage.length > 0 && 
                <Text style={tw.style('text-red-400 font-bold text-center px-2')}>{errorMessage}</Text>
              }
            <View style={tw.style('items-center')}>
              <Pressable onPress={handleRegister}>
                <Text style={tw.style('text-green-500 font-bold text-lg text-center')}>Registrera</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>) }
    </View>
  )
}
