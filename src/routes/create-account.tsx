import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Form, Error, Input, Swither, Title, Wrapper, Main, SignImg } from "../components/auth-components";
import GoogleButton from "../components/google-btn";

export default function CreateAccount() {
    const navigate=useNavigate();
    const [isLoading,setLoading]=useState(false);
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const onChange=(e:React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: {name,value},
        } =e;
        if(name==="name") {
            setName(value);
        } else if (name==="email") {
            setEmail(value);
        } else if (name==="password") {
            setPassword(value);
        }
    };
    const onSubmit=async (e:React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault();
        setError("");
        if(isLoading || name==="" || email===""||password==="") return;
        try {
            setLoading(true);
            const credentials=await createUserWithEmailAndPassword(auth,email,password);
            console.log(credentials);
            await updateProfile(credentials.user, {
                displayName:name,

            });
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
                <Title>Join 🎤</Title>
                <Form onSubmit={onSubmit}>
                    <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required/>
                    <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
                    <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
                    <Input type="submit" value={isLoading ? "Loading..." : "Create Account"}/>
                </Form>
                {error !== "" ? <Error>{error}</Error> : null}
                <Swither>
                    Already have an account? <Link to="/login">Log in&rarr;</Link>
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