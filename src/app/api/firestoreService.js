// firestoreService.js

import { arrayUnion, collection, doc, getDoc, setDoc } from "firebase/firestore";
import admin from "@/config/firebaseAdmin";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";



const firestore = admin.firestore();
const auth = admin.auth();
// Example function to add a document to Firestore
const collectionName = 'formbuilder-users';
export async function addDocument(c, data) {
  try {
    const { uid, ...userData } = data; // Extract UID from data
    const userRef = firestore.collection(c ?? collectionName).doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      console.log('User already exists in Firestore');
      return true; // Return the ID of existing document
    } else {
      await userRef.set(userData); // Add user data to Firestore
      console.log('User added to Firestore');
      return true; // Return the ID of newly added document
    }
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
}
export async function getDocument(collection, uid) {
  try {
    const data = [];
    const docRef = firestore.collection(collection);
    const querySnapshot = await docRef.where('uid', '==', uid).get();

    if (querySnapshot.empty) {
      console.log('No matching documents.');
      return false;
    }
    querySnapshot.forEach(doc => {
      data.push({
        ...doc.data(),
        id: doc.id,
      })
    });
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
}

export async function getDocumentByID(collection, uid) {
  try {
    let data = {};
    const querySnapshot = firestore.collection(collection).doc(uid)
    const promise = new Promise((resolve, reject) => {
      try {
        querySnapshot.onSnapshot((snapshot) => {
          if (snapshot.id == uid) {
            const questions = snapshot.data();
            data = { ...questions }
            resolve(data);

          }
        })

      } catch (error) {
        console.log('Error getting document:', error)
        reject(false)
      }
    })
    const response = await promise
    return response;
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
}
export async function getDocumentWithID(collection, uid, id) {
  try {
    const data = [];
    const docRef = firestore.collection(collection);
    const querySnapshot = await docRef.where('uid', '==', uid).get();

    if (querySnapshot.empty) {
      console.log('No matching documents.');
      return false;
    }
    querySnapshot.forEach(doc => {
      if (doc.id == id)
        data.push({
          ...doc.data(),
          id: doc.id,
        })
    });
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
}
export async function setDocument(collection, data, uid) {
  try {

    const docRef = firestore.collection(collection);
    const res = await docRef.add({ ...data, uid });
    return res?.id; // Return the ID of newly added document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}
export async function setDocumentByID(collection, data, uid) {
  try {

    const docRef = firestore.collection(collection).doc(uid);
    await docRef.set({ questions: admin.firestore.FieldValue.arrayUnion(...data) });
    return true; // Return the ID of newly added document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
};

export async function setDocumentByIDs(collection, data, uid) {
  try {

    const docRef = firestore.collection(collection).doc(uid);
    await docRef.set(data);
    return true; // Return the ID of newly added document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
};
export async function deleteDocument(collection, id, uid) {
  try {

    const docRef = firestore.collection(collection).doc();
    await docRef.delete(id);
    return true; // Return the ID of deleted document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}

export async function deleteDocuments(collectionName, documentIds) {
  const batch = firestore.batch();

  console.log("documentIds", documentIds)

  documentIds.forEach((docId) => {
    const docRef = firestore.collection(collectionName).doc(docId);
    batch.delete(docRef);
  });

  try {
    await batch.commit();
    console.log(`Successfully deleted ${documentIds.length} documents`);
    return true; // Return the ID of deleted document
  } catch (error) {
    console.error('Error deleting documents:', error)
    return false; // Return the ID of deleted document
  }
}

export async function updateDocument(collection, data, id) {
  try {

    const docRef = firestore.collection(collection).doc(id);
    const prevData = (await docRef.get()).data()
    const updatedDoc = await docRef.update({ ...data });
    return {
      success: true,
      prevData: prevData,
      updatedData: data
    }; // Return the ID of newly added document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}


export async function updateConversations(collection, data, promptId, currentIndex) {
  try {

    const docRef = firestore.collection(collection).doc(promptId);
    let prevData = (await docRef.get()).data().data;
    let updatedDoc;
    if (currentIndex !== undefined) {
      prevData[currentIndex] = data;
    }
    else {
      prevData.push(data);
    }
    const newData = { data: prevData };
    updatedDoc = await docRef.set(newData);
    return {
      success: true,
      prevData: prevData,
      updatedData: data
    }; // Return the ID of newly added document
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}

export async function updateDocumentField(collectionName, field, value, docId) {
  try {
    const docRef = firestore.collection(collectionName).doc(docId);
    await docRef.update({
      [field]: value
    });
    console.log('Document successfully updated!');
    return true; //
  } catch (error) {
    console.error('Error updating document:', error);
    return false;
  }
}


export async function addDocumentByEmail(data) {

  const usersRef = firestore.collection(collectionName)
  try {
    const createUserResponse = await auth.createUser(data);
    if (createUserResponse) {
      const added = usersRef.add({ ...data, uid: createUserResponse?.uid });
      return createUserResponse;
    }

    return false;
  }
  catch (error) {
    console.error('Error adding document:', error);
    return false;
  }
  // try {

  //   const createUserResponse = await createUserWithEmailAndPassword(getAuth(), data?.email, data?.password)
  //   if (createUserResponse) {
  //     const added = usersRef.add({ ...data, uid: createUserResponse?.user?.uid });
  //     return true;
  //   }

  //   // console.log('User added to Firestore', userExist)
  // } catch (error) {
  //   console.error('Error adding document:', error);
  //   return false
  // }
}
export const findDocByKey = async (key, value, collection) => {
  const usersRef = firestore.collection(collection ?? collectionName);

  const snapshot = await usersRef.where(key, '==', value).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return false;
  }

  let userData = null;
  snapshot.forEach(doc => {
    userData = { id: doc.id, ...doc.data() };
  });
  return userData;
};

export const findUserByEmailOrUsername = async (key, value, db) => {

  // Query by email
  try {
    const emailQuery = await auth.getUserByEmail(value);

    if (db) {
      return {
        message: "User found",
        success: true,
        data: await findDocByKey(key, emailQuery?.email)
      }
    }


    return {
      message: "User not found",
      success: false,
      status: 401
    }
  } catch (error) {
    if (error?.code == "app/network-error") {
      return {
        message: "Network error",
        success: false,
        status: 408
      }
    }
    else if (error?.code == "auth/user-not-found") {
      return {
        message: "User not found",
        success: false,
        status: 401
      }
    }
    return {
      message: error?.message,
      success: false,
      status: 500
    }

  }
};

export async function findDocument(collectionName, uid) {
  try {
    const docRef = firestore.collection(collectionName).doc(uid);
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('Document already exists in Firestore');
      return true; // Return the ID of existing document
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }
}


export const getChats = async (collectionName, promptId, uid) => {

  try {
    const docRef = firestore.collection(collectionName).doc(promptId)
    const doc = await docRef.get();

    if (doc.exists) {
      const currentDocument = doc?.data()?.data?.find(doc => doc.uid == uid);
      const currentIndex = doc?.data()?.data?.findIndex(doc => doc.uid == uid);

      if (currentIndex != -1) {
        return { data: currentDocument, currentIndex } // Return the ID of existing document
      }
      return {
        data: doc?.data()?.data,
        currentIndex: -1 // Return
      };
    } else {
      return {
        data: doc?.data()?.data,
        currentIndex: null // Return
      };
    }
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}

export const getAllChats = async (collectionName, promptId, uid) => {

  try {
    const docRef = firestore.collection(collectionName).doc(promptId)
    const doc = await docRef.get();

    if (doc.exists) {
      const currentDocument = doc?.data()?.data?.find(doc => doc.uid == uid);
      const currentIndex = doc?.data()?.data?.findIndex(doc => doc.uid == uid);
      return { data: currentDocument, currentIndex } // Return the ID of existing document
    } else {
      return {
        data: doc?.data()?.data,
        currentIndex: null // Return
      };
    }
  } catch (error) {
    console.error('Error adding document:', error);
    return false
  }

}
export const deleteDocumentData = async (collectionName, uid, field) => {
  try {
    const docRef = firestore.collection(collectionName).doc(uid);
    await docRef.delete();
    console.log('Document successfully deleted!');
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}
