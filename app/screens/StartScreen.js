import React, { useContext, useEffect, useState, useLayoutEffect } from "react";
import { AuthContext } from "../context_api/AuthContext";
import { View, Text, Button, ActivityIndicator, ToastAndroid, Alert, Pressable } from "react-native";
import { auth, db } from '../firebase/firebase';
import { signOut } from "firebase/auth";
import tw from 'tailwind-react-native-classnames';
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import Statistic from "../components/Statistic";
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function StartScreen() {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [statistic, setStatistic] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [infoText, setInfoText] = useState('')

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => signOut(auth)}>
          <Text style={tw.style('mr-4 text-sm tracking-wider')}>LOGGA UT</Text>
        </Pressable>
      )
    })
  })

  useEffect(() => {
    getChores()
  }, [isFocused])

  const getChores = async () => {
    try {
      const houseId = await getHouseId()

      if(!houseId) {
        setInfoText('Du har ännu inte registrerat något hushåll.')
        setIsLoading(false)
        return
      }

      const q = query(collection(db, 'chores'), where('houseId', '==', houseId))

      const querySnapshot = await getDocs(q)

      let completedChores = 0
      let addedChores = 0
      let totalAddedChores = 0
      let totalCompletedChores = 0

      querySnapshot.forEach((chore) => {
        if(chore.data().userId == authUser.uid) {
          addedChores ++
        } 
        if(chore.data().completedBy == authUser.uid) {
          completedChores++
        }
        if(chore.data().completedBy) {
          totalCompletedChores ++
        }
        totalAddedChores++
      })

      setStatistic({
        completedChores: completedChores,
        addedChores: addedChores,
        notCompletedChores: (addedChores - completedChores),
        totalAddedChores: totalAddedChores,
        totalCompletedChores: totalCompletedChores,
        totalNotCompletedChores: (totalAddedChores - totalCompletedChores)
      })
      setInfoText('')
      setIsLoading(false)

    } catch(err) {
      console.log(err)
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod, det gick inte hämta korrekt data.",
      )
    }
  }

  const getHouseId = async () => {
    const docRef = doc(db, 'users', authUser.uid)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()) {
      return docSnap.data().house
    }
  }

  return (
    <View style={tw.style('h-full bg-white items-center justify-center')}>
      {isLoading ? (
        <View style={tw.style('h-full bg-white items-center justify-center')}>
          <ActivityIndicator color="#0000ff" size="large" />
        </View>
      ) : (
        <View style={tw.style('')}>
          {infoText.length > 0 ? (
            <View style={tw.style('my-10')}>
              <Text style={tw.style('font-bold text-center text-sm tracking-wide')}>{infoText}</Text>
              <View style={tw.style('mt-10 px-10')}>
                <Pressable onPress={() => {navigation.navigate('HouseTab')}}>
                  <Text style={tw.style('border-b-2 border-gray-300 text-sm text-center')}>Klicka här för att registrera eller ansöka om att gå med i ett redan existerande hushåll.</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Statistic statistic={statistic} />
            </View>
          )}
        </View>
      )}
    </View>
  )
}