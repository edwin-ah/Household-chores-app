import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, StyleSheet, FlatList, Alert, ToastAndroid } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import InviteUserModal from './InviteUserModal';
import tw from 'tailwind-react-native-classnames';
import { Entypo } from '@expo/vector-icons'; 

export default function HandleHouse({ houseId }) {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [house, setHouse] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [requestData, setRequestData] = useState({})
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [errorText, setErrorText] = useState('')


  useEffect(() => {
    getHouse()
    const q = query(collection(db, 'requests'), where('houseId', '==', houseId), where('status', '==', 'pending'))
    // Lyssna efter nya requests hela tiden
    const unsub = onSnapshot(q, (snapshot) => {
      if(!snapshot.empty) {
        setRequestData(snapshot.docs[0].data())
        setRequestData(prevState => ({
          ...prevState, id: snapshot.docs[0].id
        }))
        setRequestModalVisible(true)
        setErrorText('')
      }
      setIsLoading(false)
    })

    return () => unsub()
  }, [])

  const getHouse = useCallback(async () => {
    const docRef = doc(db, 'houses', houseId)
    getDoc(docRef).then((docSnap) => {
      setHouse({
        id: docSnap.id,
        houseName: docSnap.data().houseName,
        residents: docSnap.data().residents
      })
      // setHouse(docSnap.data())
      // setHouse(prevState => ({
      //   ...prevState, id: docSnap.id
      // }))
    })
    .catch((err) => {
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod när husinformation skulle hämtas."
      )
    })
  })

  const acceptRequest = async () => {
    try {
      const requestRef = doc(db, 'requests', requestData.id)
      await updateDoc(requestRef, {
        status: 'accepted'
      })

      const userRef = doc(db, 'users', requestData.userId)
      await updateDoc(userRef, {
        house: requestData.houseId
      })

      const houseRef = doc(db, 'houses', requestData.houseId)
      await updateDoc(houseRef, {
        residents: arrayUnion(requestData.userId)
      })

      setRequestModalVisible(false)
      setRequestData({})
      ToastAndroid.show('Användaren har lagts till.', ToastAndroid.LONG)
    } catch(err) {
      console.log(err)
      ToastAndroid.show('Ett fel uppstod när användaren skulle läggas till i hushållet', ToastAndroid.LONG)
    }
  }

  const declineRequest = async () => {
    const requestRef = doc(db, 'requests', requestData.id)
    await updateDoc(requestRef, {
      status: 'declined'
    })

    setRequestModalVisible(false)
    setRequestData({})
  }

  const closeInviteModal = () => {
    setInviteModalVisible(false)
  }

  const handleOpenRequestModal = () => {
    if(Object.entries(requestData).length !== 0) {
      setRequestModalVisible(true)
    } else {
      setErrorText('Det finns inga inkommande förfrågningar.')
    }
  }

  return (
    <View style={tw.style('h-full bg-white items-center justify-center')}>
      {isLoading ? (
        <View style={tw.style('h-full bg-white items-center justify-center')}>
          <ActivityIndicator color="#0000ff" size="large" />
        </View>
      ) : (
        <View>
          <Text style={tw.style('mt-10 text-center text-xl font-bold')}>Ditt hushåll: {house.houseName}</Text>
          <View style={tw.style('mt-5 border-b-2 border-gray-400 items-center')}>
            <Text style={tw.style('text-lg mb-2')}>Information</Text>
            <Text>Antal boende i hushållet: {house.residents.length}</Text>
          </View>
          <View style={tw.style('items-center mt-10')}>
            <View style={tw.style('')}>
              <Pressable onPress={() => setInviteModalVisible(true)}>
                <Text style={tw.style('bg-green-500 font-bold text-white text-sm text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Lägg till användare</Text>
              </Pressable>
            </View>
          </View>

          <View>  
            <View style={tw.style('z-10')}>
              <Pressable onPress={handleOpenRequestModal}>
                <Text style={tw.style('text-green-500 border-blue-200 font-bold text-lg text-center')}>Kolla efter förfrågningar</Text>
              </Pressable>
            </View>
            {errorText.length > 0 && <Text style={tw.style('text-center')}>{errorText}</Text>}
          </View>


          <Modal animationType='slide' transparent={true} visible={inviteModalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <InviteUserModal house={house} closeInviteModal={closeInviteModal}/>
            </View>
          </Modal>

          <Modal animationType='slide' transparent={true} visible={requestModalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <View style={tw.style('relative bg-gray-100 h-full w-full')}>
                <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
                  <Pressable onPress={setRequestModalVisible}>
                    <Entypo name="cross" size={24} color="black" />
                  </Pressable>
                </View>
                  <View style={tw.style('items-center mt-10')}>
                    <Text style={tw.style('text-center text-xl font-bold')}>Inkommande förfrågan</Text>
                    <Text style={tw.style('text-center mt-5')}>Förfrågan från {requestData.fromUser} om att gå med i {house.houseName}.</Text>
                    <Pressable onPress={acceptRequest}>
                      <Text style={tw.style('bg-green-500 w-36 font-bold text-white text-lg text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Acceptera</Text>
                    </Pressable>
                    <Pressable onPress={declineRequest}>
                      <Text style={tw.style('bg-red-500 w-36 font-bold text-white text-lg text-center py-3 px-2 shadow rounded-lg')}>Neka</Text>
                    </Pressable>
                  </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  )
}
