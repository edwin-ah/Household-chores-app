import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import tw from 'tailwind-react-native-classnames';
import { Entypo, Ionicons } from '@expo/vector-icons'; 

export default function RequestModal({ uid, handleModalClose }) {
  const [searchText, setSearchText] = useState("")
  const [name, setName] = useState("")
  const [resultText, setResultText] = useState("")

  
  const handleRequest = async () => {
    try {
      // Kolla om hus finns, isåfall hämta ID.
      const q = query(collection(db, 'houses'), where('houseName', '==', searchText.toLowerCase()))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        setResultText("Inga hushåll med detta namn hittades.")
        return
      }
      const houseId = querySnapshot.docs[0].id

      // Lägg till förfrågan i requests collection
      const docRef = await addDoc(collection(db, 'requests'), {
        houseId: houseId,
        userId: uid,
        status: 'pending',
        fromUser: name
      })

      setResultText("Förfrågan har skickats.")
    } catch(err) {
      console.log(err)
      setResultText("Det gick inte skicka förfrågan.")
    }
  }

  return (
    <View style={tw.style('relative bg-white h-full w-full')}>
      <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
        <Pressable onPress={handleModalClose}>
          <Entypo name="cross" size={24} color="black" />
        </Pressable>
      </View>
      <View style={tw.style('justify-center mt-10')}>
        <Text style={tw.style('text-center text-xl font-bold')}>Skicka förfrågan</Text>
        <View style={tw.style('pl-10 my-3')}>
          <Text style={tw.style('self-start text-sm tracking-wider')}>Husnamn</Text>
          <TextInput
            style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
            placeholder='Husnamn'
            value={searchText}
            onChangeText={(e) => {setSearchText(e)}} 
          />
        </View>
        
        <View style={tw.style('pl-10 my-3')}>
          <Text style={tw.style('self-start text-sm tracking-wider')}>Ditt namn</Text>
          <TextInput  
            style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')}
            placeholder='För och efternamn'
            value={name}
            onChangeText={(e) => {setName(e)}} 
          />
        </View>
        {resultText.length > 0 && <Text style={tw.style('font-bold text-center')}>{resultText}</Text>}
        <Pressable onPress={handleRequest}>
          <Text style={tw.style('text-green-500 font-bold text-lg text-center')}>Skicka förfrågan</Text>
        </Pressable>
      </View>

    </View>
  )
}
