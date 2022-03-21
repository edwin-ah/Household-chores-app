import React, { useState, useContext } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView, ToastAndroid, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import tw from 'tailwind-react-native-classnames';
import { Entypo } from '@expo/vector-icons'; 
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import Checkbox from 'expo-checkbox';
import * as Calendar from 'expo-calendar';
import { db, storage } from '../firebase/firebase';
import { doc, setDoc, Timestamp, collection, addDoc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../context_api/AuthContext';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export default function AddChoresModal({ closeModal }) {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [choreTitle, setChoreTitle] = useState('')
  const [choreDescription, setChoreDescriptionText] = useState('')
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [dateText, setDateText] = useState('')
  const [date, setDate] = useState(null)
  const [addToCalendar, setAddToCalendar] = useState(false)
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  
  const handleDateConfirm = (date) => {
    setDateText(moment(new Date(date)).format('DD-MM-YYYY'))
    setDate(date)
    setDatePickerVisible(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    await addChoreToFirestore()

    if (addToCalendar) {
      // Kolla permissions.
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'denied') {
        Alert.alert(
          "Åtkomst nekad",
          "För att kunna använda applikationens alla funktioner måste du ge tillåtelse till telefonens kalender.",
        )
        return;
      } 
      await addEventToCalendar()
    }
    setIsLoading(false)
    
  }

  const addChoreToFirestore = async () => {
    try {
      const houseId = await getHouse()
      const docRef = await addDoc(collection(db, 'chores'), {
        title: choreTitle,
        description: choreDescription,
        date: Timestamp.fromDate(date),
        userId: authUser.uid,
        houseId: houseId,
        done: false,
        hasImage: image == null ? false : true
      })

      if(image) {
        const choreId = docRef.id
        uploadImageAsync(choreId)
      }

      ToastAndroid.show('Hushållsysslan har sparats.', ToastAndroid.LONG)
    } catch(err) {
      ToastAndroid.show('Det gick inte spara hushållsysslan nu.', ToastAndroid.LONG)
      console.log(err)
    }
    
  }

  const getHouse = async () => {
    const docRef = doc(db, 'users', authUser.uid)
    const docSnap = await getDoc(docRef)
    return docSnap.data().house
  }

  /* 
    * uploadImageAsync är funktion från Expo GitHub
    * https://github.com/expo/examples/blob/master/with-firebase-storage-upload/App.js
  */
  const uploadImageAsync = async (choreId) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = function () {
        resolve(xhr.response)
      };
      xhr.onerror = function (e) {
        console.log(e);
        ToastAndroid.show('Det gick inte ladda upp bilden.', ToastAndroid.LONG)
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob"
      xhr.open("GET", image, true)
      xhr.send(null)
    })

    const fileRef = ref(getStorage(), choreId)
    const result = await uploadBytes(fileRef, blob)

    blob.close()
  }

  const addEventToCalendar = async () => {
    try {
      const calendarId = await getCalendarId()

      await Calendar.createEventAsync(calendarId, {
        endDate: date,
        startDate: date,
        title: choreTitle,
        notes: choreDescription
      })
      ToastAndroid.show('Hushållsysslan har lagts till i din kalender.', ToastAndroid.LONG)
    } catch(err) {
      ToastAndroid.show('Det gick inte lägga till hushållsysslan i din kalender.', ToastAndroid.LONG)
      console.log(err)
    }
  }

  async function getCalendarId() {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    let calendarId = ''
    for (let i = 0; i < calendars.length; i++ ) {
      if (calendars[i].title == 'Chores Calendar')
      {
        calendarId = calendars[i].id.toString()
        return calendarId;
      }
    }
    calendarId = await createCalendar()
    return calendarId
  }

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if(status === 'denied') {
      Alert.alert(
        "Åtkomst nekad",
        "För att kunna använda applikationens alla funktioner måste du ge tillåtelse till telefonens kalender.",
      )
      return;
    }

    const result = await ImagePicker.launchCameraAsync()

    console.log(result)
    if(!result.cancelled) {
      setImage(result.uri)
    } else {
      setImage(null)
    }

  }

  /* 
    * pickImage är funktioner från expo docs
    * https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickerlaunchcameraasyncoptions
  */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  /* 
    * getDefaultCalendarSource och createCalendar är funktioner från expo docs 
    * https://docs.expo.dev/versions/latest/sdk/calendar/
  */
  // Skapa en ny kalender.
  async function getDefaultCalendarSource() {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const defaultCalendars = calendars.filter(
      (each) => each.source.name === 'Default'
    );
    return defaultCalendars.length
      ? defaultCalendars[0].source
      : calendars[0].source;
  }
  
  // Hämta calendar Id.
  async function createCalendar() {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'Calendar' };
    const newCalendarID = await Calendar.createCalendarAsync({
      title: 'Chores Calendar',
      color: 'blue',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'internalCalendarName',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return newCalendarID;
  }

  return (
    <View style={tw.style('relative bg-gray-100 h-full w-full')}>
      {isLoading ? (
        <View style={tw.style('h-full bg-gray-100 items-center justify-center')}>
          <ActivityIndicator color="#0000ff" size="large" />
        </View>
      ) : (
        <ScrollView style={tw.style('mt-10')}>
          <View style={tw.style('absolute right-1 z-10 text-gray-800 text-xl font-bold mr-4')}>
            <Pressable onPress={closeModal}>
              <Entypo name="cross" size={24} color="black" />
            </Pressable>
          </View>
          <View style={tw.style('justify-center')}>
            <Text style={tw.style('text-center text-xl font-bold')}>Lägg till syssla</Text>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Titel</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='ex. Städa'
                value={choreTitle} 
                onChangeText={(e) => {setChoreTitle(e)}}
              />
            </View>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Datum</Text>
              <Pressable onPress={showDatePicker}>
                <Text style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2', dateText.length > 0 ? 'text-black' : 'text-gray-400')}>{dateText.length > 0 ? `Valt datum: ${dateText}. Ändra Datum` : 'Välj Datum'}</Text>
              </Pressable>
            </View>
            <View style={tw.style('pl-10 my-3')}> 
              <Text style={tw.style('self-start text-sm tracking-wider')}>Beskrivning</Text>
              <TextInput 
                style={tw.style('w-80 border-2 rounded border-gray-300 py-2 px-5 my-2')} 
                placeholder='ex. Damsuga,'
                multiline={true}
                numberOfLines={4}
                value={choreDescription} 
                onChangeText={(e) => {setChoreDescriptionText(e)}}
              />
            </View>

            <View style={tw.style('items-center')}>
              <View style={tw.style('flex flex-row')}>
                <Checkbox style={tw.style('mr-8')} 
                  value={addToCalendar} 
                  onValueChange={setAddToCalendar} 
                />
                <Text>Lägg till i telefonens kalender</Text>
              </View> 
              <View style={tw.style('mt-2')}>
                <Pressable style={tw.style('')} onPress={pickImage}>
                  <Text style={tw.style('w-40 bg-blue-500 font-bold text-white text-sm text-center py-3 px-2 shadow mt-2 rounded-lg')}>Öppna bildgalleriet</Text>
                </Pressable>
                <Pressable onPress={openCamera}>
                  <Text style={tw.style('w-40 bg-blue-500 font-bold text-white text-sm text-center py-3 px-2 shadow mt-2 rounded-lg')}>Öppna kameran</Text>
                </Pressable>
              </View>
              
              {image && 
                <View style={tw.style('mt-5')}>
                  <Image source={{ uri: image }} style={{ width: 200, height: 200 }} /> 
                </View>
              }

              <View>
                <Pressable onPress={handleSave}>
                  <Text style={tw.style('w-60 bg-green-500 font-bold text-white text-lg text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Lägg till</Text>
                </Pressable>
              </View>

            </View>

            <DateTimePickerModal 
              isVisible={datePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
            />
          </View>
        </ScrollView>
      )}
    </View>
  )
}
