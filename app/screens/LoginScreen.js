import React, { useContext, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { AuthContext } from "../context_api/AuthContext";
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import RegisterUserModal from '../components/RegisterUserModal';
import tw from 'tailwind-react-native-classnames';
import { FontAwesome } from '@expo/vector-icons'; 


export default function LoginScreen () {
  const [authUser, setAuthUser] = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleLogin = () => {
    setIsLoading(true)
    signInWithEmailAndPassword(auth, email, password)
      .then((user) => {
        setAuthUser(user.user)
      })
      .catch((error) => {
        console.log(error)
        setErrorMessage('Inloggning misslyckades, kontrollera email och lösenord.')
      })
    setIsLoading(false)
  }
  

  return (
    <View style={tw.style('h-full bg-white items-center justify-center')}>
      <Text style={tw.style('text-center text-xl mt-10 font-bold')}>Logga in</Text>
      {isLoading ? (
        <View style={tw.style('h-full bg-white items-center justify-center')}>
          <ActivityIndicator color="#0000ff" size="large" />
        </View>
      ) : (
        <View style={tw.style('mt-10')}>
          
          <View style={tw.style('flex-row items-center justify-center')}>
            <View style={tw.style('')}>
              <FontAwesome name="user" size={24} color="#3b82f6" style={tw.style('pr-4')}/>
            </View>
            <View style={tw.style('')}>
              <TextInput 
                style={tw.style('w-80 border-b-2 border-gray-300 py-1 my-2')} 
                placeholder='Ange email' 
                value={email} 
                onChangeText={(e) => {setEmail(e)}}
              />
            </View>
          </View>

          <View style={tw.style('flex-row items-center justify-center')}>
            <View>
              <FontAwesome name="lock" size={24} color="#3b82f6" style={tw.style('pr-4')}/>
            </View>
            <View>
              <TextInput 
                style={tw.style('w-80 border-b-2 border-gray-300 py-1 my-2')} 
                secureTextEntry={true}
                placeholder='Ange lösenord' 
                value={password} 
                onChangeText={(e) => {setPassword(e)}}
              />
            </View>
          </View>

          {errorMessage.length > 0 && <Text style={tw.style('text-center')}>{errorMessage}</Text>}
          
          <View>
            <Pressable onPress={handleLogin}>
              <Text style={tw.style('bg-green-500 font-bold text-white text-lg text-center py-3 px-2 shadow mt-5 mb-8 rounded-lg')}>Logga in</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={tw.style('text-green-500 font-bold text-lg text-center')}>Registrera</Text>
            </Pressable>
          </View>
          
          <Modal animationType='slide' transparent={true} visible={modalVisible}>
            <View style={tw.style('h-full pt-10 shadow left-0 top-0 z-10 bg-black bg-opacity-90 items-center justify-center')}>
              <RegisterUserModal handleModalClose={handleModalClose}/>
            </View>
          </Modal>
        </View>
          )}
    </View>
  )
}