import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import { db } from '../firebase/firebase';
import { collection, doc, query, where, getDocs, updateDoc, arrayUnion, getDoc, onSnapshot, querySnapshot } from 'firebase/firestore';
import RequestModal from './RequestModal';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native-web';
import tw from 'tailwind-react-native-classnames';
import { Entypo, Ionicons } from '@expo/vector-icons'; 

export default function HandleNoHouse() {
  const navigation = useNavigation()
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [invitesData, setInvitesData] = useState([])
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'invitations'), where('userId', '==', authUser.uid), where('status', '==', 'pending'))
    // Lyssna efter nya invitations hela tiden
    const unsub = onSnapshot(q, (snapshot) => {
      let invites = []
      if(!snapshot.empty) {
        snapshot.forEach((doc) => {
          let invite = doc.data()
          invite.id = doc.id
          invites.push(invite)
        })
        setInvitesData(invites)
        setInviteModalVisible(true)
      }
      setIsLoading(false)
    })
    
    return () => unsub()
  }, [])

  const acceptInvitiation = async (invitationData) => {
    try {
      // Uppdatera hus.
      const houseRef = doc(db, 'houses', invitationData.houseId)
      await updateDoc(houseRef, {
        residents: arrayUnion(invitationData.userId)
      })

      // Uppdatera invitation doc.
      const acceptedInvRef = doc(db, 'invitations', invitationData.id)
      await updateDoc(acceptedInvRef, {
        status: 'accepted'
      })

      // Ändra statusen på alla andra invitations till denna user.
      const declinedInvites = invitesData.filter(item => item !== invitationData)
      setInvitesData(invitesData.filter(item => item === invitationData))
      if(invitesData.length > 0) {
        for (let invite of declinedInvites) {
          const invRef = doc(db, 'invitations', invite.id)
          await updateDoc(invRef, {
            status: 'declined'
          })
        }
      }

      // Lägg till huset hos user.
      const userRef = doc(db, 'users', authUser.uid)
      await updateDoc(userRef, {
        house: invitationData.houseId
      })

      setInviteModalVisible(false)
      setInvitesData([])
      navigation.navigate('Home')
      
    } catch(err) {
      console.log(err)
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod när din information skulle uppdateras.",
      )
    }
  }

  const declineInvitiation = async (invitationData) => {
    // Uppdatera invitation doc.
    const invRef = doc(db, 'invitations', invitationData.id)
    await updateDoc(invRef, {
      status: 'declined'
    })

    // Ta bort invitation ur invitesData.
    setInvitesData(invitesData.filter(item => item !== invitationData))
  }


  const handleRequestModalClose = () => {
    setRequestModalVisible(false)
  }

  const handleOpenInviteModal = () => {
    if(Object.entries(invitesData).length !== 0) {
      setInviteModalVisible(true)
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
          <Text style={tw.style('mt-10 text-center text-xl font-bold')}>Du har inget hushåll registrerat</Text>

          <View style={tw.style('my-5')}>
            <Pressable onPress={() => {navigation.navigate('RegisterHouse')}}>
              <Text style={tw.style('bg-green-500 font-bold text-white text-sm text-center py-3 px-2 shadow mt-5 rounded-lg')}>Registrera hushåll</Text>
            </Pressable>

            <Pressable onPress={() => {setRequestModalVisible(true)}}>
              <Text style={tw.style('bg-green-500 font-bold text-white text-sm text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Anmäl dig till befintligt hushåll</Text>
            </Pressable>
          </View>

          <View style={tw.style('z-10')}>
              <Pressable onPress={handleOpenInviteModal}>
                <Text style={tw.style('text-green-500 border-blue-200 font-bold text-lg text-center')}>Kolla efter Inbjudningar</Text>
              </Pressable>
            </View>
            {errorText.length > 0 && <Text style={tw.style('text-center')}>{errorText}</Text>}

          <Modal animationType='slide' transparent={true} visible={requestModalVisible}>
              <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
                <RequestModal uid={authUser.uid} handleModalClose={handleRequestModalClose} />
              </View>
          </Modal>

          <Modal animationType='slide' transparent={true} visible={inviteModalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <View style={tw.style('relative bg-gray-100 h-full w-full')}>
                <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
                  <Pressable onPress={setInviteModalVisible}>
                    <Entypo name="cross" size={24} color="black" />
                  </Pressable>
                </View>
                <View style={tw.style('items-center mt-10')}>
                  <Text style={tw.style('text-center text-xl font-bold')}>Inbjudningar</Text>
                  <FlatList style={tw.style('h-1/2 w-11/12 mt-10')} data={invitesData}
                    renderItem={({item}) => ( 
                      <View style={tw.style('w-full bg-white my-2 py-2 rounded')}>
                        <Text style={tw.style('text-center')}>Inbjudan från '{item.houseName}'</Text>
                        <View style={tw.style('flex flex-row justify-evenly my-2')}>
                          <Pressable onPress={() => acceptInvitiation(item)}>
                            <Text style={tw.style('text-sm tracking-wide')}>Acceptera</Text>
                          </Pressable>
                          <Pressable onPress={() => declineInvitiation(item)}>
                            <Text style={tw.style('text-sm tracking-wide')}>Neka</Text>
                          </Pressable>
                        </View>
                      </View>)
                    }
                    keyExtractor={item => item.id}
                  />
                </View>
              </View>
            </View>
          </Modal>

        </View>
      )}
    </View>
  )
}

