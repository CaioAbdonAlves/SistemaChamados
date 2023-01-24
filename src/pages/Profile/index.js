import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import './profile.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import avatar from '../../assets/avatar.png';
import { db, storage } from '../../services/firebaseConnection';

import { FiSettings, FiUpload } from 'react-icons/fi';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Profile() {

    const { user, signout, setUser, storageUser } = useContext(AuthContext);
    const [nome, setNome] = useState(user && user.nome);
    const [email, setEmail] = useState(user && user.email);
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
    const [imageAvatar, setImageAvatar] = useState(null);

    function handleFile(e) {
        
        if(e.target.files[0]) {
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image/png') {
                setImageAvatar(image);
                setAvatarUrl(URL.createObjectURL(e.target.files[0]))
            } else {
                alert('Envie uma imagem do tipo PNG ou JPEG');
                setImageAvatar(null);
                return null;
            }
        }

    }

    async function handleUpload() {
        const currentUid = user.uid;

        const storageRef = ref(storage, `image/${currentUid}/${imageAvatar.name}`)
        await uploadBytes(storageRef, imageAvatar)
        .then(async () => {
            console.log("Foto enviada com sucesso!");
            await getDownloadURL(ref(storage, `image/${currentUid}/${imageAvatar.name}`))
            .then(async (url) => {
                let urlFoto = url;

                await updateDoc(doc(collection(db, 'users'), user.uid), {
                    avatarUrl: urlFoto,
                    nome: nome
                })
                .then(() => {
                    let data = {
                        ...user,
                        avatarUrl: urlFoto,
                        nome: nome
                    };
                    setUser(data);
                    storageUser(data);
                    
                })
            })
        })
        .catch((error) => {
            console.log("Erro ao envia a foto " + error);
        })
    }

    async function handleSave(e) {
        e.preventDefault();
        
        if(imageAvatar === null && nome !== '') {
            const docRef = doc(collection(db, 'users'), user.uid);
            await updateDoc(docRef, {
                nome: nome
            })
            .then(() => {
                let data = {
                    ...user,
                    nome: nome
                };
                setUser(data);
                storageUser(data);
            })
            .catch((error) => {
                console.log("Ocorreu um erro ao atualizar o documento" + error);
            })
        } else if(nome !== '' && imageAvatar !== null) {
            handleUpload();
        }

    }

    return(
        <div>
            <Header />

            <div className='content'>
                <Title name="Meu perfil">
                    <FiSettings size={25} />
                </Title>
                
                <div className='container'>
                    <form className='form-profile' onSubmit={handleSave}>
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25}/>
                            </span>
                            <input type="file" accept='image/*' onChange={handleFile}/><br/>
                            { avatarUrl === null ?
                                <img src={avatar} width="250" height="250" alt="Foto de perfil do usiario" />
                                : <img src={avatarUrl} width="250" height="250" alt="Foto de perfil do usiario" />
                            }
                        </label>

                        <label>Nome:</label>
                        <input type="text" value={nome} onChange={ (e) => setNome(e.target.value) } />
                        
                        <label>Email:</label>
                        <input type="text" value={email} disabled={true} />
                            
                        <button type='submit'>Salvar</button>
                    </form>
                </div>

                <div className="container">
                    <button className='logout-btn' onClick={() => {signout()}}>
                        Sair
                    </button>
                </div>

            </div>
        </div>
    );
}