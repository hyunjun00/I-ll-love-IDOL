import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Error, Form, Input, Main, SignImg, Swither, Title, Wrapper } from "../components/auth-components";

export default function ResetPassword() {
    const navigate=useNavigate();
    const [isLoading,setLoading]=useState(false);
    const [email,setEmail]=useState("");
    const [error,setError]=useState("");
    const onChange=(e:React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: {name,value},
        } =e;
        if (name==="email") {
            setEmail(value);
        }
    };
    const onSubmit=async (e:React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault();
        setError("");
        if(isLoading || email==="") return;
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth,email);
            navigate("/login");
        } catch(e) {
            if(e instanceof FirebaseError) {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <Main>
            <Wrapper>
                <Title>Find Password 🎤</Title>
                <Form onSubmit={onSubmit}>
                    <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
                    <Input type="submit" value={isLoading ? "Loading..." : "Enter your email"}/>
                </Form>
                {error !== "" ? <Error>{error}</Error> : null}
                <Swither>
                    Don't have an account? <Link to="/create-account">Create one &rarr;</Link>
                </Swither>
                <Swither>
                    Already have an account? <Link to="/login">Log in&rarr;</Link>
                </Swither>
            </Wrapper>
            <SignImg src="idol.svg"/>
        </Main>
    );
}