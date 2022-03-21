import React from 'react'
import { Pressable, Text, View, ToastAndroid } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames'; 
import { useNavigation } from '@react-navigation/native';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';

export default function DelChoresModal({ handleModalClose, choreTitle, choreId }) {
  const navigation = useNavigation()

  const deleteChore = async () => {
    try {
      await deleteDoc(doc(db, 'chores', choreId))
      navigation.navigate('Chores')
    } catch(err) {
      console.log(err)
      ToastAndroid.show('Det gick inte radera sysslan.', ToastAndroid.LONG)
    }
  }
  return (
    <View style={tw.style('relative bg-white w-full')}>
      <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
        <Pressable onPress={handleModalClose}>
          <Entypo name="cross" size={24} color="black" />
        </Pressable>
      </View>
      <View style={tw.style('items-center py-10')}>
        <Text style={tw.style('font-bold text-lg')}>Vill du radera '{choreTitle}'?</Text>
        <View style={tw.style('flex flex-row')}>
          <View style={tw.style('pr-5')}>
            <Pressable onPress={deleteChore}>
              <Text style={tw.style('w-20 bg-red-500 font-bold text-white text-lg text-center py-1 px-1 shadow mt-5 mb-8 rounded-lg')}>Ja</Text>
            </Pressable>
          </View>
          <View style={tw.style('pl-5')}>
            <Pressable onPress={handleModalClose}>
              <Text style={tw.style('w-20 bg-green-500 font-bold text-white text-lg text-center py-1 px-1 shadow mt-5 mb-8 rounded-lg')}>Nej</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}
