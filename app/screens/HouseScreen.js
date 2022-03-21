import React, { useContext, useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context_api/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import HandleHouse from '../components/HandleHouse';
import HandleNoHouse from '../components/HandleNoHouse';
import tw from 'tailwind-react-native-classnames';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function HouseScreen() {
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({})
   
  useEffect(() => {
    getUser()
  }, [isFocused])

  const getUser = async () => {
    try {
      const docRef = doc(db, 'users', authUser.uid)
      const docSnap = await getDoc(docRef)
      setUser(docSnap.data())
      setIsLoading(false)
    }
    catch(err){
      console.log(err)
      Alert.alert(
        "Ett fel uppstod",
        "Ett fel uppstod, det gick inte hämta korrekt data.",
      )
      setIsLoading(false)
    }
   
  }

  return (
        <View>
          {isLoading ? (
            <View style={tw.style('h-full bg-white items-center justify-center')}>
              <ActivityIndicator color="#0000ff" size="large" />
            </View>
            ) : (
            <View>
              {user.house ? (
                <HandleHouse houseId={user.house} />
              ) : (
                <HandleNoHouse />
              )}
            </View>
          )}
        </View>

  )
}
