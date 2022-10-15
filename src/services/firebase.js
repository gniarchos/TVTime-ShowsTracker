import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"

const app = firebase.initializeApp({
  apiKey: "xxxxxxx",
  authDomain: "xxxxxxx",
  projectId: "xxxxxxx",
  storageBucket: "xxxxxxx",
  messagingSenderId: "xxxxxxx",
  appId: "xxxxxxx",
})

// const app = firebase.initializeApp(firebaseConfig)

// export const auth = firebase.auth()
export const db = firebase.firestore()
export const auth = app.auth()

export default app
