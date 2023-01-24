import './customers.css';
import { useState } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiUser } from 'react-icons/fi';
import { db } from '../../services/firebaseConnection';
import { collection, doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

export default function Customers() {

    const [nomeFantasia, setNomeFantasia] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [endereco, setEndereco] = useState("");

    async function handleAdd(e) {
        e.preventDefault();

        if(nomeFantasia !== '' && cnpj !== '' && endereco !== '') {
            const docRef = doc(collection(db, 'customers'));
            await setDoc(docRef, {
                nomeFantasia: nomeFantasia,
                cnpj: cnpj,
                endereco: endereco
            })
            .then(() => {
                setNomeFantasia("");
                setCnpj("");
                setEndereco("");
                toast.info("Empresa cadastrada com sucesso!");
            })
            .catch((error) => {
                console.log("Ocorreu um erro ao cadastrar a empresa  " + error);
                toast.error("Erro ao cadastrar essa empresa");
            })
        } else {
            toast.error("Preencha todos os campos");
        }
    }

    return(
        <div>
            <Header />

            <div className='content'>
                <Title name="Clientes">
                    <FiUser size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile customers' onSubmit={handleAdd}>
                        <label>Nome fantasia</label>
                        <input type="text" placeholder='Nome da sua empresa' value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />

                        <label>Cnpj</label>
                        <input type="text" placeholder='Seu CNPJ' value={cnpj} onChange={(e) => setCnpj(e.target.value)} />

                        <label>Endereço</label>
                        <input type="text" placeholder='Endereço da empresa' value={endereco} onChange={(e) => setEndereco(e.target.value)} />

                        <button type='submit'>Cadastrar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}