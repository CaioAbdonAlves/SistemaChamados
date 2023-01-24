import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{

    function loadStorage(){
      const storageUser = localStorage.getItem('SistemaUser');

      if(storageUser){
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }
  
      setLoading(false);
    }
    
    loadStorage();

  }, [])

  // Logar Usuário
  async function signIn(email, password) {
    setLoadingAuth(true);

    await signInWithEmailAndPassword(auth, email, password)
    .then(async (value) => {
      let uid = value.user.uid;
      const docRef = doc(db, 'users', uid)
      const userProfile = await getDoc(docRef)

      let data = {
        uid: uid,
        nome: userProfile.data().nome,
        avatarUrl: userProfile.data().avatarUrl,
        email: value.user.email
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Logado com sucesso!");
      navigate('/dashboard');

    })
    .catch((error) => {
      console.log(console.log("Ocorreu um erro ao logar o usuário" + error));
      toast.error("Erro ao fazer login");
      setLoadingAuth(false);
    })
  }

  // Cadastrar Usuário
  async function signUp(email, password, nome){
    setLoadingAuth(true);

    await createUserWithEmailAndPassword(auth, email, password)
    .then( async (value)=>{
      let uid = value.user.uid;

      await collection(db, 'users')
      setDoc(doc(db, 'users', uid), {
        nome: nome,
        avatarUrl: null,
      })
      .then( () => {

        let data = {
          uid: uid,
          nome: nome,
          email: value.user.email,
          avatarUrl: null
        };

        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success('Cadastrado com sucesso!');

      })

    })
    .catch((error)=>{
      console.log(error);
      toast.error("ops, erro ao realizar o cadastro");
      setLoadingAuth(false);
    })

  }


  // Salvar informações do Usuário no LocalStorage
  function storageUser(data){
    localStorage.setItem('SistemaUser', JSON.stringify(data));
  }

  // Deslogar Usuário
  async function signout(){
    await signOut(auth);
    localStorage.removeItem('SistemaUser');
    setUser(null);
  }


  return(
    <AuthContext.Provider 
    value={{ 
      signed: !!user,  
      user, 
      loading, 
      signUp,
      signIn,
      signout,
      loadingAuth,
      setUser,
      storageUser
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
