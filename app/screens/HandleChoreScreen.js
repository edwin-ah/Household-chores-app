import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, Alert, ToastAndroid, Image, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AuthContext } from '../context_api/AuthContext';
import { getDownloadURL, ref } from 'firebase/storage';
import { AntDesign } from '@expo/vector-icons';
import DelChoresModal from '../components/DelChoresModal';


export default function HandleChoreScreen({ route }) {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const navigation = useNavigation()
  const { choreId } = route.params
  const [chore, setChore] = useState({})
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [image, setImage] = useState(null)
  const [delModalVisible, setDelModalVisible] = useState(false)

  useEffect(() => {
    getChore()
  }, [])

  async function getChore() {
    try {
      const docRef = doc(db, 'chores', choreId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        Alert.alert(
          "Ett fel uppstod",
          "Det gick inte hitta denna hushållsyssla.",
        )
        navigation.goBack()
      }

      let dateWithDay = docSnap.data().date.toDate().toDateString()
      let dateWithoutDay = dateWithDay.split(' ').slice(1).join(' ')

      setChore({
        date: dateWithoutDay,
        description: docSnap.data().description,
        done: docSnap.data().done,
        houseId: docSnap.data().houseId,
        title: docSnap.data().title,
        userId: docSnap.data().userId,
        id: choreId,
      })

      if(docSnap.data().hasImage) {
        getImage()
      }

      setIsLoading(false)
    } catch(err) {
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod när sysslan skulle hämtas.",
      )
      navigation.goBack()
    }
  }

  const handleChangeDone = async () => {
    setIsLoading(true)
    const isDone = !chore.done
    const choreRef = doc(db, 'chores', chore.id)
    await updateDoc(choreRef, {
      done: isDone,
      completedBy: isDone ? authUser.uid : ''
    })
    ToastAndroid.show('Hushållsysslan har status har uppdaterats.', ToastAndroid.LONG)
    setChore(prevState => ({
      ...prevState, done: !prevState.done
    }))
    setIsLoading(false)
  }

  const getImage = async () => {
    const pathRef = ref(storage, choreId)
    getDownloadURL(pathRef)
      .then((url) => {
        setImage(url)
      })
      .catch((err) => {
        console.log(err)
        ToastAndroid.show('Det gick inte hämta bilden för denna hushållsyssla.', ToastAndroid.LONG)
      })
  }

  const handeOpenModal = () => {
    setDelModalVisible(true)
  }
  const handleModalClose = () => {
    setDelModalVisible(false)
  }

  return (
    <View style={tw.style('h-full bg-white px-10')}>
      {isLoading ? 
        (
          <View style={tw.style('h-full bg-white items-center justify-center')}>
            <ActivityIndicator color="#0000ff" size="large" />
          </View>
        ) : (
        <ScrollView>
          <Text style={tw.style('font-bold text-lg mt-10 text-center tracking-wide')}>{chore.title}</Text>
          <View>
            <Text style={tw.style('text-sm tracking-wider')}>Beskrivning</Text>
            <View style={tw.style('bg-gray-200 rounded-xl shadow py-5 px-4')}>
              {chore.description !== '' ? (<Text>{chore.description}</Text>) : (<Text>Beskrivning saknas</Text>)}
            </View>
          </View>

          <View style={tw.style('items-center mt-5')}>
            <Text>
              <AntDesign name="calendar" size={24} color="black" />  
              {chore.date}
            </Text>

            {image && 
              <View style={tw.style('my-5')}>
                <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
              </View>
            }
            
            {chore.done ? (
            <Pressable onPress={handleChangeDone}>
              <View style={tw.style('flex flex-row px-4 py-2 my-5')}>
                <Text style={tw.style('text-red-500 font-bold text-lg text-center')}>Markera som inte färdig</Text>
              </View>
            </Pressable>
            ) : (
            <Pressable onPress={handleChangeDone}>
              <View style={tw.style('flex flex-row bg-gray-100 rounded shadow px-4 py-2 my-5')}>
                <Text style={tw.style('text-green-500 font-bold text-lg text-center')}>Markera som färdig</Text>
                <Ionicons name="checkmark" size={24} color="#10b981" />
              </View>
            </Pressable>
            )}

              <View>
                <Pressable style={tw.style('z-10')} onPress={handeOpenModal}>
                  <Text style={tw.style('text-center')}>Ta bort hushållsyssla</Text>
                </Pressable>
              </View>
          </View>


          <Modal animationType='slide' transparent={true} visible={delModalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <DelChoresModal handleModalClose={handleModalClose} choreTitle={chore.title} choreId={chore.id}/>
            </View>
          </Modal>
        </ScrollView>

        
      )}
    </View>
  )
}
