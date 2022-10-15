import React, { useContext, useEffect } from "react"
import { auth, db } from "../services/firebase"
import { serverTimestamp } from "firebase/firestore"
// import { GoogleAuthProvider, signInWithPopup } from "firebase/compat/auth"

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = React.useState()
  const [loading, setLoading] = React.useState(true)

  function signup(email, password, username, fname, lname) {
    // return auth.createUserWithEmailAndPassword(email, password)
    return auth.createUserWithEmailAndPassword(email, password).then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({
        username: username,
        fname: fname,
        lname: lname,
        member_since: serverTimestamp(),
        watching_time: 0,
        total_episodes: 0,
        profile_cover_selection: "default",
      })
    })
  }

  // function loginGoogle() {
  //   const provider = new GoogleAuthProvider()
  //   return auth.signInWithPopup(auth, provider)
  // }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout() {
    return auth.signOut()
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    // loginGoogle,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
