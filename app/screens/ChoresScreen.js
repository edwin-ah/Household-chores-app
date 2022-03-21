import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import tw from 'tailwind-react-native-classnames';
import AddChoresModal from '../components/AddChoresModal';
import { db } from '../firebase/firebase';
import { query, orderBy, where, collection, getDocs, doc, getDoc } from "firebase/firestore";  
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 
import { Alert } from 'react-native-web';

export default function ChoresScreen() { 
  const [authUser, setAuthUser] = useContext(AuthContext)
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [choresData, setChoresData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredChores, setFilteredChores] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [infoText, setInfoText] = useState('')

  useEffect(() => {
    getChoresData()
  }, [isFocused])

  const getChoresData = async () => {
    try {
      const user = await getUser()

      if(user.house == null) {
        setInfoText('Du måste vara med i ett hushåll för att kunna registrera hushållsysslor.')
        setIsLoading(false)
        return
      }

      const choresRef = collection(db, 'chores')
      const q = query(choresRef, where("houseId", '==', user.house), orderBy('date'))
      const querySnapshot = await getDocs(q)
      
      const chores = []
      querySnapshot.forEach((doc) => {
        let dateWithDay = doc.data().date.toDate().toDateString()
        let dateWithoutDay = dateWithDay.split(' ').slice(1).join(' ')
        let chore = {
          date: dateWithoutDay,
          description: doc.data().description,
          done: doc.data().done,
          houseId: doc.data().houseId,
          title: doc.data().title,
          userId: doc.data().userId,
          id: doc.id
        }
        chores.push(chore)
      });
      setInfoText('')
      setChoresData(chores)
      // Fyll filteredChores med all data första gången sidan laddas.
      setFilteredChores(chores)
      setIsLoading(false)

    } catch(err) {
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod, det gick inte hämta korrekt data.",
      )
    }

  } 

  const getUser = async () => {
    const docRef = doc(db, 'users', authUser.uid)
    const docSnap = await getDoc(docRef)
    return docSnap.data()
  }

  const closeAddModal = () => {
    setAddModalVisible(false)
    getChoresData()
  }

  const filterChores = (filter) => {
    if (typeof(filter) == 'boolean') {
      const filteredData = choresData.filter((chore) => chore.done == filter)
      setFilteredChores(filteredData)
    } else {
      setFilteredChores(choresData)
    }
  }

  return (
      <View style={tw.style('h-full bg-white')}>
        {isLoading ? 
        (
          <View style={tw.style('h-full bg-white items-center justify-center')}>
            <ActivityIndicator color="#0000ff" size="large" />
          </View>
        ) : (
        <View>
          {infoText.length > 0 ? (
            <View style={tw.style('h-full items-center justify-center')}>
              <Text style={tw.style('text-center')}>
                {infoText}
              </Text>
            </View>
          ) : (
          <View>
          <View style={tw.style('flex flex-row items-center border-b-2 border-gray-200')}>
            <Text style={tw.style('pl-10 text-sm tracking-wide')}>Filtrera:</Text>
            <Picker
              selectedValue={selectedFilter}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue) => {setSelectedFilter(itemValue); filterChores(itemValue)}}
            >
              <Picker.Item label="Alla" value="none" />
              <Picker.Item label="Färdiga" value={true} />
              <Picker.Item label="Inte Färdiga" value={false} />
            </Picker>
          </View>
          <View>
            <FlatList data={filteredChores}
              style={tw.style('h-3/4')}
              renderItem={({item}) => ( 
              <View style={tw.style('w-11/12 mx-auto my-5 bg-white rounded shadow py-3 border-l-2', item.done ? 'border-green-200' : 'border-red-200')}>
                <TouchableOpacity onPress={() => {navigation.navigate('HandleChore', { choreId: item.id })}}>
                  <View style={tw.style('flex flex-row justify-between')}>
                    <View style={tw.style('pl-10')}>
                      <Text style={tw.style('text-lg')}>{item.title}</Text>
                      <View style={tw.style('self-start')}>
                        <Text>Färdig: {item.done ? 'Ja' : 'Nej'}</Text>
                       </View>
                    </View>
                    <View style={tw.style('pr-10')}>
                      <Text style={tw.style('text-xs text-gray-400')}>Datum: {item.date}</Text>
                      <View style={tw.style('self-end mt-2 rounded-full bg-blue-200 p-2')}>
                        <AntDesign  name="arrowright" size={18} color="black" />
                      </View>
                    </View>
                  </View>
                  
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id}
            />
          </View>
          <View style={tw.style('flex flex-row justify-evenly')}>
              <Pressable onPress={() => {setAddModalVisible(true)}}>
                <Text style={tw.style('bg-blue-400 font-bold text-white text-lg text-center py-3 px-2 mt-5 shadow rounded-lg')}>Lägg till ny syssla</Text>
              </Pressable>
            </View>
          

          <Modal animationType='slide' transparent={true} visible={addModalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <AddChoresModal animationType='slide' closeModal={ closeAddModal }/>
            </View>
          </Modal>
          </View>
          )}
        </View>

        
        )}
      </View>
  )
}
