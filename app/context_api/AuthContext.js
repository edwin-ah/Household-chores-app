import React, { useState, createContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, } from '../firebase/firebase';

export const AuthContext = createContext()

export const AuthProvider = (props) => {
  const [authUser, setAuthUser] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if(user) {
        setAuthUser(user)
      } else {
        setAuthUser(null)
        setLoggedInUser(null)
      }
      setLoading(false)
    })
    // return unsubAuth()
  }, [])

  

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {!loading && props.children}
    </AuthContext.Provider>
  )
}