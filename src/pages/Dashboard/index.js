import './dashboard.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Title from '../../components/Title';
import Modal from '../../components/Modal';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { db } from '../../services/firebaseConnection';
import { collection, limit, orderBy, query, getDocs, startAfter, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

export default function Dashboard(){

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [lastDocs, setLastDocs] = useState();

  const [showPostModal, setShowPostModal] = useState(false);
  const [detail, setDetail] = useState();

  useEffect(() => {

    loadChamados();

    return () => {

    }
  }, [])

  async function loadChamados() {
    // const ref = await collection(db, 'chamados');
    // onSnapshot(ref, (snapshot) => {
    //   updateState(snapshot);
    // }, (error) => {
    //   console.log("Algo deu errado ", error);
    //   setLoadingMore(false);
    // })
    const ref = await query(collection(db, 'chamados'), orderBy("created", "desc"), limit(5));
    getDocs(ref)
    .then((snapshot) => {
      updateState(snapshot)
    })
    .catch((error) => {
      console.log("Algo deu errado ", error);
      setLoadingMore(false);
    })

    setLoading(false);

  }

  async function updateState(snapshot) {
      const isCollectionEmpty = snapshot.size === 0;
      
      if(!isCollectionEmpty) {
        let lista = [];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            assunto: doc.data().assunto,
            cliente: doc.data().cliente,
            clienteId: doc.data().clienteId,
            created: doc.data().created,
            createdFormated: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
            status: doc.data().status,
            complemento: doc.data().complemento
          })
        })

        const lastDoc = snapshot.docs[snapshot.docs.length -1];

        setChamados(chamados => [...chamados, ...lista]);
        setLastDocs(lastDoc);
        console.log(chamados)
        console.log(lastDoc)

      } else{
        setIsEmpty(true);
      }

      setLoadingMore(false);
  }

  async function handleMore() {
    setLoadingMore(true);
    const refMore = await query(collection(db, 'chamados'), orderBy("created", "desc"), startAfter(lastDocs), limit(5));
    getDocs(refMore)
    .then((snapshot) => {
      updateState(snapshot)
    })
    .catch((error) => {
      console.log("Ocorreu um erro ao buscar mais chamados" + error);
    })
  }

  function togglePostModal(chamado) {
    setShowPostModal(!showPostModal);
    setDetail(chamado);
  }

  if(loading) {
    return(
      <div>
        <Header />

        <div className='content'>
          <Title name='Atendimentos'>
            <FiMessageSquare size={25} />
          </Title>

          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>

        </div>
      </div>
    )
  }

  return(
    <div>
      <Header />

      <div className='content'>
        <Title name='Atendimentos'>
          <FiMessageSquare size={25} />
        </Title>

        {chamados.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum chamado registrado...</span>
            <Link to='/new' className='new'>
              <FiPlus size={25} color='#FFF' />
              Novo Chamado
            </Link>
          </div>
        ) : (
          <>
            <Link to='/new' className='new'>
              <FiPlus size={25} color='#FFF' />
              Novo Chamado
            </Link>

            <table>
              <thead>
                <tr>
                  <th scope='col'>Cliente</th>
                  <th scope='col'>Assunto</th>
                  <th scope='col'>Status</th>
                  <th scope='col'>Cadastrado em:</th>
                  <th scope='col'>#</th>
                </tr>
              </thead>
              <tbody>
                {chamados.map((chamado, index) => {
                  return(
                    <tr key={index}>
                    <td data-label='Cliente'>{chamado.cliente}</td>
                    <td data-label='Assunto'>{chamado.assunto}</td>
                    <td data-label='Status'>
                      <span className='badge' style={{backgroundColor: chamado.status === 'Aberto' ? '#5cb85c' : '#999'}}>{chamado.status}</span>
                    </td>
                    <td data-label='Cadastrado'>{chamado.createdFormated}</td>
                    <td data-label='#'>
                      <button className='action' style={{backgroundColor: '#3583f6'}} onClick={ () => togglePostModal(chamado) }>
                        <FiSearch color='#FFF' size={17} />
                      </button>
                      <Link className='action' style={{backgroundColor: '#f6a935'}} to={`/new/${chamado.id}`}>
                        <FiEdit2 color='#FFF' size={17} />
                      </Link>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>

            {loadingMore && <h3 style={{ textAlign: 'center', marginTop: 15 }}>Buscando chamados...</h3>}
            { !loadingMore && !isEmpty && <button className='btn-more' onClick={handleMore}>Buscar mais</button>}

          </>
        )}

      </div>

      {showPostModal && (
        <Modal 
          conteudo={detail}
          close={togglePostModal}
        />
      )}
      
    </div>
  )
}