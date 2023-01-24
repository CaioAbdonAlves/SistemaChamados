import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "../services/firebaseConnection";

export default function Private({ children }) {

    const [signed, setSigned] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkLogin() {
            await onAuthStateChanged(auth, (user) => {
                if(user) {
                    setSigned(true);
                    setLoading(false);

                } else {
                    setSigned(false);
                    setLoading(false);
                    
                }
            })
        }
        checkLogin();
    }, []);

    if(loading) {
        return(
            <div>
                <h1> Carregando... </h1>
            </div>
        );
    }

    if(!signed) {
        return <Navigate to='/' />
    }

    return children;
}