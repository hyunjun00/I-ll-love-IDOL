import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Error, Form, Input, Main, SignImg, Swither, Title, Wrapper } from "../components/auth-components";
import GoogleButton from "../components/google-btn";

export default function CreateAccount() {
    const navigate=useNavigate();
    const [isLoading,setLoading]=useState(false);
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const onChange=(e:React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: {name,value},
        } =e;
        if (name==="email") {
            setEmail(value);
        } else if (name==="password") {
            setPassword(value);
        }
    };
    const onSubmit=async (e:React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault();
        setError("");
        if(isLoading || email===""||password==="") return;
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth,email,password);
            navigate("/");
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
                <Title>Log into 🎤</Title>
                <Form onSubmit={onSubmit}>
                    <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
                    <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
                    <Input type="submit" value={isLoading ? "Loading..." : "Login"}/>
                </Form>
                {error !== "" ? <Error>{error}</Error> : null}
                <Swither>
                    Don't have an account? <Link to="/create-account">Create one &rarr;</Link>
                </Swither>
                <Swither>
                    Forgot password? <Link to="/forgot-password">Find password &rarr;</Link>
                </Swither>
                <GoogleButton />
            </Wrapper>
            <SignImg src="idol.svg"/>
        </Main>
    );
}