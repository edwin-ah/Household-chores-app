import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';

export default function RegisterHouseScreen() {
  const navigation = useNavigation()
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [houseName, setHouseName] = useState("")

  const handleRegister = async () => {
    try {
      const uid = authUser.uid

      // Lägg till huset i firestore.
      const houseDocRef = await addDoc(collection(db, 'houses'), {
        houseName: houseName.toLowerCase(),
        residents: [uid]
      })
  
      // Uppdatera den inloggade användaren.
      const userDocRef = doc(db, 'users', uid)
      updateDoc(userDocRef, {
        house: houseDocRef.id
      })
  
      navigation.goBack()
    } catch(err) {
      console.log(err)
      Alert.alert(
        'Ett fel uppstod',
        'Ett fel uppstod och det gick inte registrera hushållet.'
      )
    }
    
  }

  return (
    <View style={tw.style('h-full bg-white')}>
      <Text style={tw.style('text-center text-xl mt-10 font-bold')}>Registrera Hushåll</Text>
      <View style={tw.style('pl-10 my-10')}>
        <Text style={tw.style('self-start text-sm tracking-wider')}>Hushållets Namn</Text>
        <TextInput 
          style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')}
          placeholder='Husets namn'
          value={houseName}
          onChangeText={(e) => { setHouseName(e)}}/>
      </View>
      <View style={tw.style('items-center')}>
        <Pressable onPress={handleRegister}>
          <Text style={tw.style('bg-green-500 w-1/3 font-bold text-white text-sm text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Registrera</Text>
        </Pressable>
      </View>
    </View>
  )
}
