import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import tw from 'tailwind-react-native-classnames';
import { Entypo } from '@expo/vector-icons'; 

export default function InviteUserModal({ house, closeInviteModal }) {
  const [email, setEmail] = useState('')
  const [resultText, setResultText] = useState('')

  const sendInvite = async () => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        setResultText('Inga användare med denna email finns.')
        return
      }
      const userId = querySnapshot.docs[0].id
  
      // Lägg till inbjudan i invitations collection
      const docRef = await addDoc(collection(db, 'invitations'), {
        userId: userId,
        houseId: house.id,
        status: 'pending',
        houseName: house.houseName
      })
  
      setResultText('Inbjudan har skickats.')
    } catch(err) {
      setResultText('Det gick inte skicka inbjudan nu.')
    }
  }

  return (
    <View style={tw.style('relative bg-white h-full w-full')}>
      <View style={tw.style('mt-10')}>
        <View style={tw.style('absolute right-1 text-gray-800 text-xl font-bold mr-4')}>
          <Pressable onPress={closeInviteModal}>
            <Entypo name="cross" size={24} color="black" />
          </Pressable>
        </View>
        <Text style={tw.style('text-center text-xl font-bold mt-5')}>Bjud in användare</Text>

        <View style={tw.style('items-center justify-center')}>
          <View style={tw.style('mt-10 mb-4')}>
            <Text style={tw.style('self-start text-sm tracking-wider')}>Ange användarens email</Text>
            <TextInput 
              style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
              placeholder='example@gmail.com'
              value={email}
              onChangeText={(e) => {setEmail(e)}}/>
          </View>
          {resultText.length > 0 && <Text style={tw.style('font-bold text-center')}>{resultText}</Text>}
          <View>
            <Pressable onPress={sendInvite}>
              <Text style={tw.style('bg-green-500 font-bold text-white text-lg text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Skicka inbjudan</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </View>
  )
}
