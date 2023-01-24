import './new.css';
import { useState, useEffect, useContext } from 'react';
import Title from '../../components/Title';
import Header from '../../components/Header';
import { FiPlusCircle } from 'react-icons/fi';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify'
import { db } from '../../services/firebaseConnection';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

export default function New() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(0);

    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [complemento, setComplemento] = useState('');

    const [idCustomer, setIdCustomer] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        async function loadCustomers() {
           const collectionRef = await collection(db, "customers")
            await getDocs(collectionRef)
            .then((snapshot) => {
                let lista = [];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                })

                if(lista.length === 0){
                    console.log("Nenhuma empresa encontrada");
                    setCustomers([ {id: '1', nomeFantasia: 'Freela'} ]);
                    setLoadCustomers(false);
                    return;
                }

                setCustomers(lista);
                setLoadCustomers(false);

                if(id) {
                    loadId(lista);
                }

           })
           .catch((error) => {
                console.log("Ocorreu um erro " + error);
                setLoadCustomers(false);
                setCustomers([ {id: '1', nomeFantasia: ''} ]);
           })
        }

        loadCustomers();

    }, [id]);

    async function loadId(lista) {
        const docRef = doc(db, "chamados", id);
        getDoc(docRef)
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto);
            setStatus(snapshot.data().status);
            setComplemento(snapshot.data().complemento);
            
            let index = lista.findIndex(item => item.id === snapshot.data().clienteId );
            setCustomerSelected(index);
            setIdCustomer(true);
        })
        .catch((error) => {
            console.log("ERRO NO ID PASSADO", error);
            setIdCustomer(false);
        })
    }

    async function handleRegister(e) {
        e.preventDefault();

        if(idCustomer) {
            const docRef = await doc(db, "chamados", id);
            setDoc(docRef, {
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            })
            .then(() => {
                toast.success("Chamado Editado com sucesso!");
                setCustomerSelected(0);
                setComplemento('');
                navigate('/dashboard');
            })
            .catch((error) => {
                toast.error("Ops, erro ao editar o chamado, tente mais tarde. ");
                console.log(error);
            })

            return ;
        }
        
        await collection(db, 'chamados')
        setDoc(doc(db, 'chamados', (user.uid + Math.random())), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            status: status,
            complemento: complemento,
            userId: user.uid
        })
        .then(() => {
            toast.success("Chamado registrado com sucesso");
            setComplemento('');
            setCustomerSelected(0);
        })
        .catch((error) => {
            toast.error("Ops, erro ao registar. Tente mais tarde.");
            console.log(error);
        })
    }

    //Chamado quando troca o assunto
    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    //Chamado quando troca o status
    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    //Chamado quando troca de cliente
    function handleChangeCustomers(e) {
        // console.log('index do cliente selecionado: ', e.target.value);
        // console.log('cliente selecionado', customers[e.target.value]);
        setCustomerSelected(e.target.value);
    }

    return(
        <div>
            <Header />

            <div className='content'>
                <Title name='Novo chamado'>
                    <FiPlusCircle size={25} />
                </Title>

                <div className="container">
                    <form className='form-profile' onSubmit={handleRegister}>
                        
                        <label>Cliente</label>

                        {loadCustomers ? (
                            <input type="text" disabled={true} value="Carregando clientes..."/>
                        ) : (

                            <select value={customerSelected} onChange={handleChangeCustomers}>
                                {customers.map((item, index) => {
                                    return(
                                        <option key={item.id} value={index}>
                                            {item.nomeFantasia}
                                        </option>
                                    )
                                })}
                            </select>

                        )}

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte" >Suporte</option>
                            <option value="Visita Tecnica" >Visita Tecnica</option>
                            <option value="Financeiro" >Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input 
                            type="radio"
                            name='radio'
                            value="Aberto"
                            onChange={handleOptionChange}
                            checked = { status === 'Aberto' }
                            />
                            <span>Em Aberto</span>
                            
                            <input 
                            type="radio"
                            name='radio'
                            value="Progresso"
                            onChange={handleOptionChange}
                            checked = { status === 'Progresso' }
                            />
                            <span>Progresso</span>

                            <input 
                            type="radio"
                            name='radio'
                            value="Atendido"
                            onChange={handleOptionChange}
                            checked = { status === 'Atendido' }
                            />
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea 
                            type="text"
                            placeholder='Descreva o seu problema (opcional).'
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        <button type='submit'>Registrar</button>

                    </form>
                </div>
            </div>
        </div>
    );
}